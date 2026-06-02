import { NotificationRepository } from '../repositories/NotificationRepository';
import { INotification } from '../models/Notification';

const notifRepo = new NotificationRepository();

export class NotificationService {
  async getUserNotifications(userId: string, page = 1): Promise<{ notifications: INotification[]; total: number; unread: number }> {
    return notifRepo.findByUser(userId, page, 20);
  }

  async markAllRead(userId: string): Promise<void> {
    await notifRepo.markAllRead(userId);
  }

  async markRead(notifId: string): Promise<INotification | null> {
    return notifRepo.markRead(notifId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return notifRepo.countUnread(userId);
  }
}
