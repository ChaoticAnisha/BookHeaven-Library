import { RentalRepository } from '../repositories/RentalRepository';
import { BookRepository } from '../repositories/BookRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { UserRepository } from '../repositories/UserRepository';
import { IRental } from '../models/Rental';
import { createError } from '../middleware/errorHandler';
import { calculatePenalty, isOverdue } from '../utils/helpers';
import { config } from '../config/config';

const rentalRepo = new RentalRepository();
const bookRepo = new BookRepository();
const notifRepo = new NotificationRepository();
const userRepo = new UserRepository();

export class RentalService {
  async rentBook(
    userId: string,
    bookId: string,
    serialNumber: string,
    fromDate: string,
    toDate: string,
    purpose?: string
  ): Promise<IRental> {
    const book = await bookRepo.findById(bookId);
    if (!book) throw createError('Book not found', 404);
    if (book.hardCopyCount <= 0) throw createError('No hard copies available', 400);

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to <= from) throw createError('Return date must be after borrow date', 400);

    const user = await userRepo.findById(userId);
    if (!user) throw createError('User not found', 404);

    const tier = config.rental.tiers[user.membership];
    const activeCount = await rentalRepo.countActiveByUser(userId);
    if (activeCount >= tier.maxBooks) {
      throw createError(`Your ${user.membership} plan allows maximum ${tier.maxBooks} books at a time (exceeds active rental limit)`, 400);
    }

    const bookSerial = await bookRepo.findBySerial(serialNumber);
    if (!bookSerial) throw createError('Serial number not found', 400);

    const rental = await rentalRepo.create({
      user: user._id,
      book: book._id,
      serialNumber,
      fromDate: from,
      toDate: to,
      purpose,
      status: 'active',
    });

    // Update book stock
    await bookRepo.decrementHardCopy(bookId);
    if (book.hardCopyCount - 1 === 0) {
      await bookRepo.update(bookId, { status: 'borrowed' });
    }

    // Notify user
    await notifRepo.create({
      user: userId,
      type: 'rental_confirmed',
      title: 'Rental Confirmed',
      message: `Your rental for "${book.title}" is confirmed. Due date: ${to.toDateString()}`,
      relatedBook: book._id.toString(),
      relatedRental: rental._id.toString(),
    });

    return rental;
  }

  async returnBook(rentalId: string, userId: string, serialNumber?: string): Promise<{ rental: IRental; penalty: number }> {
    const rental = await rentalRepo.findById(rentalId);
    if (!rental) throw createError('Rental not found', 404);
    if (rental.user._id.toString() !== userId) throw createError('Unauthorized', 403);
    if (rental.status === 'returned') throw createError('Book already returned (Rental is not active)', 400);
    if (serialNumber && rental.serialNumber !== serialNumber) {
      throw createError('Serial number does not match', 400);
    }

    const returnDate = new Date();
    const penalty = calculatePenalty(rental.toDate, returnDate);

    const updated = await rentalRepo.update(rentalId, {
      status: 'returned',
      returnedDate: returnDate,
      penaltyAmount: penalty,
    });

    if (!updated) throw createError('Failed to update rental', 500);

    // Restore book stock
    const bookId = (rental.book as { _id: { toString: () => string } })._id.toString();
    await bookRepo.incrementHardCopy(bookId);
    const book = await bookRepo.findById(bookId);
    if (book && book.hardCopyCount > 0 && book.status === 'borrowed') {
      await bookRepo.update(bookId, { status: 'in-shelf' });
    }

    return { rental: updated, penalty };
  }

  async getUserRentals(userId: string): Promise<IRental[]> {
    return rentalRepo.findByUser(userId);
  }

  async getActiveUserRentals(userId: string): Promise<IRental[]> {
    return rentalRepo.findActiveByUser(userId);
  }

  async getAllRentals(page = 1, limit = 20): Promise<{ rentals: IRental[]; total: number }> {
    return rentalRepo.findAll({}, page, limit);
  }

  async updateOverdueStatus(): Promise<void> {
    const overdue = await rentalRepo.findOverdue();
    for (const rental of overdue) {
      await rentalRepo.update(rental._id.toString(), { status: 'overdue' });
    }
  }

  async getRentalStats(): Promise<any> {
    const [total, active, overdue, returned] = await Promise.all([
      rentalRepo.countAll(),
      Rental_count('active'),
      rentalRepo.countOverdue(),
      Rental_count('returned'),
    ]);
    return {
      total,
      active,
      overdue,
      returned,
      activeCount: active,
      overdueCount: overdue,
      returnedCount: returned,
      totalCount: total
    };
  }
}

async function Rental_count(status: string): Promise<number> {
  const { Rental } = await import('../models/Rental');
  return Rental.countDocuments({ status });
}
