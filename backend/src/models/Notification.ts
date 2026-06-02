import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'restock' | 'reservation' | 'due_reminder' | 'new_arrival' | 'weekly_digest' | 'rental_confirmed' | 'payment_success';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedBook?: mongoose.Types.ObjectId;
  relatedRental?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['restock', 'reservation', 'due_reminder', 'new_arrival', 'weekly_digest', 'rental_confirmed', 'payment_success'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedBook: { type: Schema.Types.ObjectId, ref: 'Book' },
    relatedRental: { type: Schema.Types.ObjectId, ref: 'Rental' },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
