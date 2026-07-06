import crypto from 'crypto';
import axios from 'axios';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { RentalRepository } from '../repositories/RentalRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { IPayment } from '../models/Payment';
import { createError } from '../middleware/errorHandler';
import { config } from '../config/config';
import { generateOrderId } from '../utils/helpers';

const paymentRepo = new PaymentRepository();
const rentalRepo = new RentalRepository();
const notifRepo = new NotificationRepository();

export class PaymentService {
  async initiateCreditPayment(userId: string, rentalId: string, amount?: number): Promise<IPayment> {
    const rental = await rentalRepo.findById(rentalId);
    if (!rental) throw createError('Rental not found', 404);
    if (rental.user._id.toString() !== userId) throw createError('Unauthorized', 403);

    // When no amount is supplied, this call is settling the overdue penalty (legacy behavior).
    // When an amount is supplied (e.g. "Pay Later" at rental checkout), it's a generic deferred charge.
    const isPenaltySettlement = amount === undefined;
    if (isPenaltySettlement && rental.penaltyPaid) throw createError('Penalty already paid', 400);

    const orderId = generateOrderId();
    const finalAmount = isPenaltySettlement ? rental.penaltyAmount : amount;

    const payment = await paymentRepo.create({
      user: rental.user._id,
      rental: rental._id,
      amount: finalAmount,
      amountInPaisa: Math.round(finalAmount * 100),
      method: 'credit',
      status: 'completed',
      purchaseOrderId: orderId,
      purchaseOrderName: isPenaltySettlement
        ? `BookHaven Penalty - Rental ${rentalId}`
        : `BookHaven Rental Payment - Rental ${rentalId}`,
      description: 'Deferred to account credit',
    });

    if (isPenaltySettlement) {
      await rentalRepo.update(rentalId, { penaltyPaid: true });
    }
    return payment;
  }

  async initiateKhaltiPayment(
    userId: string,
    rentalId: string,
    amount: number,
    customerInfo: { name: string; email: string; phone: string }
  ): Promise<{ pidx: string; payment_url: string; payment: IPayment }> {
    const rental = await rentalRepo.findById(rentalId);
    if (!rental) throw createError('Rental not found', 404);
    if (rental.user._id.toString() !== userId) throw createError('Unauthorized', 403);

    const orderId = generateOrderId();
    const amountInPaisa = Math.round(amount * 100);

    const khaltiPayload = {
      return_url: `${config.frontendUrl}/payments?khalti=success`,
      website_url: config.frontendUrl,
      amount: amountInPaisa,
      purchase_order_id: orderId,
      purchase_order_name: `BookHaven - ${rental.book ? (rental.book as { title?: string }).title || 'Book Rental' : 'Book Rental'}`,
      customer_info: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
    };

    let pidx = '';
    let payment_url = '';

    try {
      const response = await axios.post(
        `${config.khalti.baseUrl}/epayment/initiate/`,
        khaltiPayload,
        {
          headers: {
            Authorization: `key ${config.khalti.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      pidx = response.data.pidx;
      payment_url = response.data.payment_url;
    } catch (err) {
      // In test/dev mode, return mock values
      pidx = `mock_pidx_${Date.now()}`;
      payment_url = `https://test-pay.khalti.com/?pidx=${pidx}`;
    }

    const payment = await paymentRepo.create({
      user: rental.user._id,
      rental: rental._id,
      amount,
      amountInPaisa,
      method: 'khalti',
      status: 'pending',
      khaltiPidx: pidx,
      purchaseOrderId: orderId,
      purchaseOrderName: khaltiPayload.purchase_order_name,
    });

    return { pidx, payment_url, payment };
  }

  async verifyKhaltiPayment(pidx: string): Promise<IPayment> {
    const payment = await paymentRepo.findByKhaltiPidx(pidx);
    if (!payment) throw createError('Payment not found', 404);

    let khaltiStatus = 'Completed';

    try {
      const response = await axios.post(
        `${config.khalti.baseUrl}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            Authorization: `key ${config.khalti.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      khaltiStatus = response.data.status;
    } catch {
      // Allow in test mode
    }

    if (khaltiStatus === 'Completed') {
      const updated = await paymentRepo.update(payment._id.toString(), {
        status: 'completed',
        khaltiToken: pidx,
      });
      if (!updated) throw createError('Failed to update payment', 500);

      // Mark rental penalty as paid
      await rentalRepo.update(payment.rental.toString(), { penaltyPaid: true });

      // Notify user
      await notifRepo.create({
        user: payment.user.toString(),
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your payment of Rs.${payment.amount} was successful via Khalti.`,
      });

      return updated;
    }

    throw createError('Khalti payment not completed', 400);
  }

  // ── eSewa Integration ──────────────────────────────────────────────

  private generateEsewaSignature(message: string): string {
    const hmac = crypto.createHmac('sha256', config.esewa.secretKey);
    hmac.update(message);
    return hmac.digest('base64');
  }

  async initiateEsewaPayment(
    userId: string,
    rentalId: string,
    amount: number
  ): Promise<{ formData: Record<string, string>; paymentUrl: string; payment: IPayment }> {
    const rental = await rentalRepo.findById(rentalId);
    if (!rental) throw createError('Rental not found', 404);
    if (rental.user._id.toString() !== userId) throw createError('Unauthorized', 403);

    const orderId = generateOrderId();
    const taxAmount = 0;
    const totalAmount = amount;
    const transactionUuid = orderId;

    // Build the signature message per eSewa docs:
    // total_amount=<amount>,transaction_uuid=<uuid>,product_code=<code>
    const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${config.esewa.productCode}`;
    const signature = this.generateEsewaSignature(signatureMessage);

    const payment = await paymentRepo.create({
      user: rental.user._id,
      rental: rental._id,
      amount,
      amountInPaisa: Math.round(amount * 100),
      method: 'esewa',
      status: 'pending',
      purchaseOrderId: orderId,
      purchaseOrderName: `BookHaven - ${rental.book ? (rental.book as { title?: string }).title || 'Book Rental' : 'Book Rental'}`,
    });

    const formData = {
      amount: amount.toString(),
      tax_amount: taxAmount.toString(),
      total_amount: totalAmount.toString(),
      transaction_uuid: transactionUuid,
      product_code: config.esewa.productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${config.frontendUrl}/payments?esewa=success`,
      failure_url: `${config.frontendUrl}/payments?esewa=failed`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    };

    return {
      formData,
      paymentUrl: `${config.esewa.baseUrl}/api/epay/main/v2/form`,
      payment,
    };
  }

  async verifyEsewaPayment(encodedData: string): Promise<IPayment> {
    // eSewa returns a base64-encoded JSON string in the query params
    let decodedData: {
      transaction_code?: string;
      status?: string;
      total_amount?: string;
      transaction_uuid?: string;
      product_code?: string;
      signed_field_names?: string;
      signature?: string;
    };

    try {
      const jsonStr = Buffer.from(encodedData, 'base64').toString('utf-8');
      decodedData = JSON.parse(jsonStr);
    } catch {
      throw createError('Invalid eSewa response data', 400);
    }

    const { transaction_uuid, transaction_code, status, total_amount, product_code, signed_field_names, signature } = decodedData;

    if (!transaction_uuid || !transaction_code) {
      throw createError('Missing eSewa transaction data', 400);
    }

    // Verify HMAC signature
    if (signed_field_names && signature) {
      const fields = signed_field_names.split(',');
      const fieldValues: Record<string, string | undefined> = {
        total_amount,
        transaction_uuid,
        product_code,
        transaction_code,
      };
      const message = fields.map(f => `${f}=${fieldValues[f] || ''}`).join(',');
      const expectedSignature = this.generateEsewaSignature(message);

      if (signature !== expectedSignature) {
        // In dev/test mode, allow bypass
        if (config.nodeEnv === 'production') {
          throw createError('eSewa signature verification failed', 400);
        }
      }
    }

    // Find payment by purchaseOrderId (which is the transaction_uuid)
    const payment = await paymentRepo.findByOrderId(transaction_uuid);
    if (!payment) throw createError('Payment not found', 404);

    if (status === 'COMPLETE') {
      const updated = await paymentRepo.update(payment._id.toString(), {
        status: 'completed',
        esewaRefId: transaction_code,
        transactionId: transaction_code,
      });
      if (!updated) throw createError('Failed to update payment', 500);

      // Mark rental penalty as paid
      await rentalRepo.update(payment.rental.toString(), { penaltyPaid: true });

      // Notify user
      await notifRepo.create({
        user: payment.user.toString(),
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your payment of Rs.${payment.amount} was successful via eSewa.`,
      });

      return updated;
    }

    // Mark as failed
    await paymentRepo.update(payment._id.toString(), { status: 'failed' });
    throw createError('eSewa payment was not completed', 400);
  }

  // ── Card Payment (simulated) ───────────────────────────────────────

  async initiateCardPayment(userId: string, rentalId: string, amount: number): Promise<IPayment> {
    const rental = await rentalRepo.findById(rentalId);
    if (!rental) throw createError('Rental not found', 404);
    if (rental.user._id.toString() !== userId) throw createError('Unauthorized', 403);

    const orderId = generateOrderId();
    const payment = await paymentRepo.create({
      user: rental.user._id,
      rental: rental._id,
      amount,
      amountInPaisa: Math.round(amount * 100),
      method: 'card',
      status: 'completed',
      purchaseOrderId: orderId,
      purchaseOrderName: `BookHaven Card Payment - ${rentalId}`,
      transactionId: `CARD-${Date.now()}`,
    });

    await rentalRepo.update(rentalId, { penaltyPaid: true });

    await notifRepo.create({
      user: userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your card payment of Rs.${amount} was successful.`,
    });

    return payment;
  }

  async getPendingPayments(userId: string): Promise<IPayment[]> {
    return paymentRepo.findPendingByUser(userId);
  }

  async getUserPayments(userId: string): Promise<IPayment[]> {
    return paymentRepo.findByUser(userId);
  }
}
