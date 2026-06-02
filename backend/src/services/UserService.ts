import { UserRepository } from '../repositories/UserRepository';
import { RentalRepository } from '../repositories/RentalRepository';
import { IUser } from '../models/User';
import { createError } from '../middleware/errorHandler';

const userRepo = new UserRepository();
const rentalRepo = new RentalRepository();

export class UserService {
  async getProfile(userId: string): Promise<IUser> {
    const user = await userRepo.findById(userId);
    if (!user) throw createError('User not found', 404);
    return user;
  }

  async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser> {
    // Prevent role/email updates via this endpoint
    const { role: _role, email: _email, password: _password, ...safeData } = data as Record<string, unknown>;
    const user = await userRepo.update(userId, safeData as Partial<IUser>);
    if (!user) throw createError('User not found', 404);
    return user;
  }

  async updateNotificationPreferences(userId: string, prefs: IUser['notificationPreferences']): Promise<IUser> {
    const user = await userRepo.updateNotificationPreferences(userId, prefs);
    if (!user) throw createError('User not found', 404);
    return user;
  }

  async getReadingHistory(userId: string): Promise<any> {
    const rentals = await rentalRepo.findByUser(userId);
    return rentals.filter((r) => r.status === 'returned');
  }

  async getDashboardStats(userId: string): Promise<any> {
    const [rentals, active] = await Promise.all([
      rentalRepo.findByUser(userId),
      rentalRepo.countActiveByUser(userId),
    ]);
    const readingsVal = rentals.filter((r) => r.status === 'returned').length;
    return {
      readings: readingsVal,
      wishlist: 0,
      active,
      readingsCount: readingsVal,
      wishlistCount: 0,
      activeCount: active,
    };
  }

  async getAllUsers(page = 1, limit = 20): Promise<{ users: IUser[]; total: number }> {
    return userRepo.findAll({}, page, limit);
  }

  async suspendUser(userId: string): Promise<IUser> {
    const user = await userRepo.deactivate(userId);
    if (!user) throw createError('User not found', 404);
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await userRepo.delete(userId);
    if (!user) throw createError('User not found', 404);
  }

  async getUserStats(): Promise<{ total: number; admins: number; librarians: number; members: number }> {
    const { User } = await import('../models/User');
    const [total, admins, librarians, members] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'librarian' }),
      User.countDocuments({ role: 'member' }),
    ]);
    return { total, admins, librarians, members };
  }
}
