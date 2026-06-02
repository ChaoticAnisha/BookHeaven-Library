import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'khalti' | 'credit';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rental: mongoose.Types.ObjectId;
  amount: number;
  amountInPaisa: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  khaltiPidx?: string;
  khaltiToken?: string;
  purchaseOrderId: string;
  purchaseOrderName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rental: { type: Schema.Types.ObjectId, ref: 'Rental', required: true },
    amount: { type: Number, required: true, min: 0 },
    amountInPaisa: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['card', 'khalti', 'credit'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    transactionId: { type: String },
    khaltiPidx: { type: String },
    khaltiToken: { type: String },
    purchaseOrderId: { type: String, required: true },
    purchaseOrderName: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ user: 1, status: 1 });
PaymentSchema.index({ purchaseOrderId: 1 }, { unique: true });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
