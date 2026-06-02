import { Rental, IRental } from '../models/Rental';
import { FilterQuery } from 'mongoose';

export class RentalRepository {
  async findById(id: string): Promise<IRental | null> {
    return Rental.findById(id).populate('user', 'name email').populate('book');
  }

  async create(data: Partial<IRental>): Promise<IRental> {
    const rental = new Rental(data);
    return rental.save();
  }

  async update(id: string, data: Partial<IRental>): Promise<IRental | null> {
    return Rental.findByIdAndUpdate(id, data, { new: true }).populate('user', 'name email').populate('book');
  }

  async findByUser(userId: string): Promise<IRental[]> {
    return Rental.find({ user: userId })
      .populate('book')
      .sort({ createdAt: -1 });
  }

  async findActiveByUser(userId: string): Promise<IRental[]> {
    return Rental.find({ user: userId, status: { $in: ['active', 'overdue'] } })
      .populate('book')
      .sort({ createdAt: -1 });
  }

  async findAll(filter: FilterQuery<IRental> = {}, page = 1, limit = 20): Promise<{ rentals: IRental[]; total: number }> {
    const skip = (page - 1) * limit;
    const [rentals, total] = await Promise.all([
      Rental.find(filter)
        .populate('user', 'name email')
        .populate('book', 'title author')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Rental.countDocuments(filter),
    ]);
    return { rentals, total };
  }

  async findOverdue(): Promise<IRental[]> {
    return Rental.find({
      status: 'active',
      toDate: { $lt: new Date() },
    })
      .populate('user', 'name email notificationPreferences')
      .populate('book', 'title');
  }

  async countActiveByUser(userId: string): Promise<number> {
    return Rental.countDocuments({ user: userId, status: { $in: ['active', 'overdue'] } });
  }

  async countAll(): Promise<number> {
    return Rental.countDocuments();
  }

  async countOverdue(): Promise<number> {
    return Rental.countDocuments({ status: { $in: ['active'] }, toDate: { $lt: new Date() } });
  }
}
