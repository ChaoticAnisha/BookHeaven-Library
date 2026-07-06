import { User, IUser } from '../models/User';
import { FilterQuery } from 'mongoose';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password');
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.trim().toLowerCase() });
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password');
  }

  async findAll(filter: FilterQuery<IUser> = {}, page = 1, limit = 20): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    return { users, total };
  }

  async updateNotificationPreferences(id: string, prefs: IUser['notificationPreferences']): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { notificationPreferences: prefs }, { new: true }).select('-password');
  }

  async deactivate(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password');
  }

  async delete(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }

  async countAll(): Promise<number> {
    return User.countDocuments();
  }

  async addToWishlist(id: string, bookId: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $addToSet: { wishlist: bookId } }, { new: true })
      .select('-password')
      .populate('wishlist');
  }

  async removeFromWishlist(id: string, bookId: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $pull: { wishlist: bookId } }, { new: true })
      .select('-password')
      .populate('wishlist');
  }

  async getWishlist(id: string): Promise<IUser | null> {
    return User.findById(id).select('wishlist').populate('wishlist');
  }
}
