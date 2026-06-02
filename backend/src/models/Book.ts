import mongoose, { Document, Schema } from 'mongoose';

export type BookStatus = 'in-shelf' | 'borrowed' | 'reserved' | 'maintenance';
export type BookCondition = 'new' | 'good' | 'fair' | 'poor';

export interface IBook extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  author: string;
  year: number;
  edition?: string;
  isbn13: string;
  coverUrl?: string;
  category: string;
  subCategory?: string;
  buyPrice: number;
  rentPrice: number;
  condition: BookCondition;
  rating: number;
  ratingCount: number;
  serialNumber: string;
  publisher?: string;
  language: string;
  pages: number;
  publishedIn?: string;
  hardCopyCount: number;
  eBookAvailable: boolean;
  audioBookAvailable: boolean;
  locationCode?: string;
  status: BookStatus;
  description?: string;
  isVisible: boolean;
  currentlyReading: number;
  haveRead: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    edition: { type: String },
    isbn13: { type: String, required: true, unique: true },
    coverUrl: { type: String },
    category: { type: String, required: true },
    subCategory: { type: String },
    buyPrice: { type: Number, required: true, min: 0 },
    rentPrice: { type: Number, required: true, min: 0 },
    condition: { type: String, enum: ['new', 'good', 'fair', 'poor'], default: 'good' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    serialNumber: { type: String, required: true, unique: true },
    publisher: { type: String },
    language: { type: String, default: 'English' },
    pages: { type: Number, required: true },
    publishedIn: { type: String },
    hardCopyCount: { type: Number, default: 0 },
    eBookAvailable: { type: Boolean, default: false },
    audioBookAvailable: { type: Boolean, default: false },
    locationCode: { type: String },
    status: { type: String, enum: ['in-shelf', 'borrowed', 'reserved', 'maintenance'], default: 'in-shelf' },
    description: { type: String },
    isVisible: { type: Boolean, default: true },
    currentlyReading: { type: Number, default: 0 },
    haveRead: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BookSchema.index({ title: 'text', author: 'text', category: 'text', isbn13: 'text' });
BookSchema.index({ category: 1 });
BookSchema.index({ status: 1 });
BookSchema.index({ createdAt: -1 });

export const Book = mongoose.model<IBook>('Book', BookSchema);
