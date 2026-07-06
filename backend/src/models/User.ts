import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'librarian' | 'member';
export type MembershipTier = 'Basic' | 'Student' | 'Premium';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  membership: MembershipTier;
  address?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  wishlist: mongoose.Types.ObjectId[];
  isActive: boolean;
  notificationPreferences: {
    restock: boolean;
    reservation: boolean;
    dueReminder: boolean;
    newArrivals: boolean;
    weeklyDigest: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'librarian', 'member'], default: 'member' },
    membership: { type: String, enum: ['Basic', 'Student', 'Premium'], default: 'Basic' },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    bio: { type: String },
    avatar: { type: String },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Book', default: [] }],
    isActive: { type: Boolean, default: true },
    notificationPreferences: {
      restock: { type: Boolean, default: true },
      reservation: { type: Boolean, default: true },
      dueReminder: { type: Boolean, default: true },
      newArrivals: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
