import { Notification, INotification, NotificationType } from '../models/Notification';

export class NotificationRepository {
  async create(data: {
    user: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedBook?: string;
    relatedRental?: string;
  }): Promise<INotification> {
    const notification = new Notification(data);
    return notification.save();
  }

  async findByUser(userId: string, page = 1, limit = 20): Promise<{ notifications: INotification[]; total: number; unread: number }> {
    const skip = (page - 1) * limit;
    const [notifications, total, unread] = await Promise.all([
      Notification.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ user: userId }),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);
    return { notifications, total, unread };
  }

  async markAllRead(userId: string): Promise<void> {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  }

  async markRead(id: string): Promise<INotification | null> {
    return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ user: userId, isRead: false });
  }

  async deleteByUser(userId: string): Promise<void> {
    await Notification.deleteMany({ user: userId });
  }
}
