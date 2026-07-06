import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  year: z.number().int().min(1000).max(new Date().getFullYear() + 1),
  edition: z.string().optional(),
  isbn13: z.string().min(10, 'ISBN must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  buyPrice: z.number().min(0),
  rentPrice: z.number().min(0),
  pages: z.number().int().positive(),
  hardCopyCount: z.number().int().min(0),
  eBookAvailable: z.boolean().default(false),
  audioBookAvailable: z.boolean().default(false),
  serialNumber: z.string().min(1, 'Serial number is required'),
  publisher: z.string().optional(),
  language: z.string().default('English'),
  publishedIn: z.string().optional(),
  locationCode: z.string().optional(),
  description: z.string().optional(),
  coverUrl: z.string().url().optional().or(z.literal('')),
});

export const rentalSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  purpose: z.string().optional(),
});

export const returnSchema = z.object({
  rentalId: z.string().min(1, 'Rental ID is required'),
});

export const cancelSchema = z.object({
  rentalId: z.string().min(1, 'Rental ID is required'),
});

export const paymentSchema = z.object({
  rentalId: z.string().min(1, 'Rental ID is required'),
  method: z.enum(['card', 'khalti', 'credit']),
  amount: z.number().positive('Amount must be positive'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export const notificationPreferencesSchema = z.object({
  restock: z.boolean(),
  reservation: z.boolean(),
  dueReminder: z.boolean(),
  newArrivals: z.boolean(),
  weeklyDigest: z.boolean(),
});
