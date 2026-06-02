import mongoose, { Document, Schema } from 'mongoose';

export type RentalStatus = 'active' | 'returned' | 'overdue' | 'cancelled';

export interface IRental extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  book: mongoose.Types.ObjectId;
  serialNumber: string;
  fromDate: Date;
  toDate: Date;
  returnedDate?: Date;
  status: RentalStatus;
  purpose?: string;
  penaltyAmount: number;
  penaltyPaid: boolean;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RentalSchema = new Schema<IRental>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    serialNumber: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    returnedDate: { type: Date },
    status: { type: String, enum: ['active', 'returned', 'overdue', 'cancelled'], default: 'active' },
    purpose: { type: String },
    penaltyAmount: { type: Number, default: 0 },
    penaltyPaid: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RentalSchema.index({ user: 1, status: 1 });
RentalSchema.index({ book: 1, status: 1 });
RentalSchema.index({ toDate: 1, status: 1 });

export const Rental = mongoose.model<IRental>('Rental', RentalSchema);
