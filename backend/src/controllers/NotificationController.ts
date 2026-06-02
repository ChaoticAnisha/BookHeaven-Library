import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';
import { AuthRequest } from '../middleware/auth';

const notifService = new NotificationService();

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const { page = '1' } = req.query as { page?: string };
      const result = await notifService.getUserNotifications(req.user._id.toString(), Number(page));
      res.json({ success: true, data: result.notifications, total: result.total, unread: result.unread });
    } catch (error) { next(error); }
  }

  async markAllRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      await notifService.markAllRead(req.user._id.toString());
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) { next(error); }
  }

  async markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await notifService.markRead(req.params.id);
      res.json({ success: true, message: 'Notification marked as read', data: updated });
    } catch (error) { next(error); }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const count = await notifService.getUnreadCount(req.user._id.toString());
      res.json({ success: true, data: { count } });
    } catch (error) { next(error); }
  }
}
