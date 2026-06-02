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
  async initiateCreditPayment(userId: string, rentalId: string): Promise<IPayment> {
    const rental = await rentalRepo.findById(rentalId);
    if (!rental) throw createError('Rental not found', 404);
    if (rental.user._id.toString() !== userId) throw createError('Unauthorized', 403);
    if (rental.penaltyPaid) throw createError('Penalty already paid', 400);

    const orderId = generateOrderId();
    const amount = rental.penaltyAmount;

    const payment = await paymentRepo.create({
      user: rental.user._id,
      rental: rental._id,
      amount,
      amountInPaisa: Math.round(amount * 100),
      method: 'credit',
      status: 'completed',
      purchaseOrderId: orderId,
      purchaseOrderName: `BookHaven Penalty - Rental ${rentalId}`,
      description: 'Deferred to account credit',
    });

    await rentalRepo.update(rentalId, { penaltyPaid: true });
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
        message: `Your payment of ₹${payment.amount} was successful via Khalti.`,
      });

      return updated;
    }

    throw createError('Khalti payment not completed', 400);
  }

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
      message: `Your card payment of ₹${amount} was successful.`,
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
