import { BookRepository, BookFilter } from '../repositories/BookRepository';
import { IBook } from '../models/Book';
import { createError } from '../middleware/errorHandler';

const bookRepo = new BookRepository();

export class BookService {
  async search(filter: BookFilter, page = 1, limit = 12): Promise<{ books: IBook[]; total: number; pages: number }> {
    const result = await bookRepo.search(filter, page, limit);
    return { ...result, pages: Math.ceil(result.total / limit) };
  }

  async getById(id: string): Promise<IBook> {
    const book = await bookRepo.findById(id);
    if (!book) throw createError('Book not found', 404);
    return book;
  }

  async getNewArrivals(limit = 12): Promise<IBook[]> {
    return bookRepo.findNewArrivals(limit);
  }

  async getRecommended(categories: string[], limit = 12): Promise<IBook[]> {
    return bookRepo.findRecommended(categories, limit);
  }

  async getSimilar(id: string, limit = 6): Promise<IBook[]> {
    const book = await this.getById(id);
    return bookRepo.findSimilar(id, book.category, limit);
  }

  async createBook(data: Partial<IBook>): Promise<IBook> {
    const existing = await bookRepo.findByIsbn(data.isbn13 as string);
    if (existing) throw createError('A book with this ISBN already exists', 409);
    const existingSerial = await bookRepo.findBySerial(data.serialNumber as string);
    if (existingSerial) throw createError('A book with this serial number already exists', 409);
    return bookRepo.create(data);
  }

  async updateBook(id: string, data: Partial<IBook>): Promise<IBook> {
    const book = await bookRepo.update(id, data);
    if (!book) throw createError('Book not found', 404);
    return book;
  }

  async deleteBook(id: string): Promise<void> {
    const book = await bookRepo.delete(id);
    if (!book) throw createError('Book not found', 404);
  }

  async getAllBooks(page = 1, limit = 20): Promise<{ books: IBook[]; total: number; pages: number }> {
    const result = await bookRepo.findAll(page, limit);
    return { ...result, pages: Math.ceil(result.total / limit) };
  }

  async getStats(): Promise<any> {
    const [total, inShelf, borrowed, reserved, totalCopies, categories] = await Promise.all([
      bookRepo.countAll(),
      bookRepo.countByStatus('in-shelf'),
      bookRepo.countByStatus('borrowed'),
      bookRepo.countByStatus('reserved'),
      bookRepo.sumCopies(),
      bookRepo.countUniqueCategories(),
    ]);
    return {
      total,
      inShelf,
      borrowed,
      reserved,
      totalBooks: total,
      totalCopies: totalCopies || total,
      categoriesCount: categories || 0,
    };
  }
}
