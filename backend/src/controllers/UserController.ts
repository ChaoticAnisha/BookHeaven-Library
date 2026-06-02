import { Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middleware/auth';

const userService = new UserService();

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const user = await userService.getProfile(req.user._id.toString());
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const user = await userService.updateProfile(req.user._id.toString(), req.body);
      res.json({ success: true, message: 'Profile updated', data: user });
    } catch (error) { next(error); }
  }

  async updateNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const user = await userService.updateNotificationPreferences(req.user._id.toString(), req.body);
      res.json({ success: true, message: 'Preferences updated', data: user });
    } catch (error) { next(error); }
  }

  async getReadingHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const history = await userService.getReadingHistory(req.user._id.toString());
      res.json({ success: true, data: history });
    } catch (error) { next(error); }
  }

  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const stats = await userService.getDashboardStats(req.user._id.toString());
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20' } = req.query as Record<string, string>;
      const result = await userService.getAllUsers(Number(page), Number(limit));
      res.json({ success: true, data: result.users });
    } catch (error) { next(error); }
  }

  async suspendUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.suspendUser(req.params.id);
      res.json({ success: true, message: 'User suspended', data: user });
    } catch (error) { next(error); }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteUser(req.params.id);
      res.json({ success: true, message: 'User deleted' });
    } catch (error) { next(error); }
  }

  async getUserStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await userService.getUserStats();
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }
}
