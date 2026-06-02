import { UserRepository } from '../repositories/UserRepository';
import { generateToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';
import { IUser } from '../models/User';

const userRepo = new UserRepository();

export class AuthService {
  async register(data: { name: string; email: string; password: string }): Promise<{ user: Partial<IUser>; token: string }> {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) throw createError('Email already registered', 409);

    const user = await userRepo.create(data);
    const token = generateToken(user._id.toString(), user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.membership,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await userRepo.findByEmail(email);
    if (!user) throw createError('Invalid email or password', 401);
    if (!user.isActive) throw createError('Account is deactivated', 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw createError('Invalid email or password', 401);

    const token = generateToken(user._id.toString(), user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        membership: user.membership,
        avatar: user.avatar,
        notificationPreferences: user.notificationPreferences,
      },
      token,
    };
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await userRepo.findById(userId);
    if (!user) throw createError('User not found', 404);
    return user;
  }
}
