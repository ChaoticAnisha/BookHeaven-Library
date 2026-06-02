import { Payment, IPayment } from '../models/Payment';
import { FilterQuery } from 'mongoose';

export class PaymentRepository {
  async findById(id: string): Promise<IPayment | null> {
    return Payment.findById(id).populate('user', 'name email').populate('rental');
  }

  async findByOrderId(purchaseOrderId: string): Promise<IPayment | null> {
    return Payment.findOne({ purchaseOrderId });
  }

  async findByKhaltiPidx(pidx: string): Promise<IPayment | null> {
    return Payment.findOne({ khaltiPidx: pidx });
  }

  async create(data: Partial<IPayment>): Promise<IPayment> {
    const payment = new Payment(data);
    return payment.save();
  }

  async update(id: string, data: Partial<IPayment>): Promise<IPayment | null> {
    return Payment.findByIdAndUpdate(id, data, { new: true });
  }

  async findPendingByUser(userId: string): Promise<IPayment[]> {
    return Payment.find({ user: userId, status: 'pending' })
      .populate('rental')
      .sort({ createdAt: -1 });
  }

  async findByUser(userId: string): Promise<IPayment[]> {
    return Payment.find({ user: userId })
      .populate('rental')
      .sort({ createdAt: -1 });
  }

  async findAll(filter: FilterQuery<IPayment> = {}, page = 1, limit = 20): Promise<{ payments: IPayment[]; total: number }> {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('user', 'name email')
        .populate('rental')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Payment.countDocuments(filter),
    ]);
    return { payments, total };
  }
}
