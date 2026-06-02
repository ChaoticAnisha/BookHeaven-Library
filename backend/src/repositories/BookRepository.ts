import { Book, IBook } from '../models/Book';
import { FilterQuery } from 'mongoose';

export interface BookFilter {
  category?: string;
  status?: string;
  eBookAvailable?: boolean;
  audioBookAvailable?: boolean;
  search?: string;
  searchField?: string;
  genre?: string;
}

export class BookRepository {
  async findById(id: string): Promise<IBook | null> {
    return Book.findById(id);
  }

  async findByIsbn(isbn13: string): Promise<IBook | null> {
    return Book.findOne({ isbn13 });
  }

  async findBySerial(serialNumber: string): Promise<IBook | null> {
    return Book.findOne({ serialNumber });
  }

  async create(data: Partial<IBook>): Promise<IBook> {
    const book = new Book(data);
    return book.save();
  }

  async update(id: string, data: Partial<IBook>): Promise<IBook | null> {
    return Book.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IBook | null> {
    return Book.findByIdAndDelete(id);
  }

  async search(filter: BookFilter, page = 1, limit = 12): Promise<{ books: IBook[]; total: number }> {
    const query: FilterQuery<IBook> = { isVisible: true };

    if (filter.category || filter.genre) {
      query.category = filter.category || filter.genre;
    }

    if (filter.status) query.status = filter.status;
    if (filter.eBookAvailable !== undefined) query.eBookAvailable = filter.eBookAvailable;
    if (filter.audioBookAvailable !== undefined) query.audioBookAvailable = filter.audioBookAvailable;

    if (filter.search) {
      const regex = new RegExp(filter.search, 'i');
      if (filter.searchField === 'title') {
        query.title = regex;
      } else if (filter.searchField === 'author') {
        query.author = regex;
      } else if (filter.searchField === 'genre' || filter.searchField === 'category') {
        query.category = regex;
      } else if (filter.searchField === 'isbn') {
        query.isbn13 = regex;
      } else if (filter.searchField === 'subCategory') {
        query.subCategory = regex;
      } else {
        query.$or = [
          { title: regex },
          { author: regex },
          { category: regex },
          { isbn13: regex },
        ];
      }
    }

    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      Book.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Book.countDocuments(query),
    ]);
    return { books, total };
  }

  async findNewArrivals(limit = 12): Promise<IBook[]> {
    return Book.find({ isVisible: true }).sort({ createdAt: -1 }).limit(limit);
  }

  async findRecommended(categories: string[], limit = 12): Promise<IBook[]> {
    if (categories.length === 0) {
      return Book.find({ isVisible: true, status: 'in-shelf' }).sort({ rating: -1 }).limit(limit);
    }
    return Book.find({ isVisible: true, category: { $in: categories }, status: 'in-shelf' })
      .sort({ rating: -1 })
      .limit(limit);
  }

  async findAll(page = 1, limit = 20): Promise<{ books: IBook[]; total: number }> {
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      Book.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Book.countDocuments(),
    ]);
    return { books, total };
  }

  async countAll(): Promise<number> {
    return Book.countDocuments();
  }

  async countByStatus(status: string): Promise<number> {
    return Book.countDocuments({ status });
  }

  async decrementHardCopy(id: string): Promise<IBook | null> {
    return Book.findByIdAndUpdate(
      id,
      { $inc: { hardCopyCount: -1 } },
      { new: true }
    );
  }

  async incrementHardCopy(id: string): Promise<IBook | null> {
    return Book.findByIdAndUpdate(
      id,
      { $inc: { hardCopyCount: 1 } },
      { new: true }
    );
  }

  async sumCopies(): Promise<number> {
    const result = await Book.aggregate([
      { $group: { _id: null, totalCopies: { $sum: '$hardCopyCount' } } }
    ]);
    return result[0]?.totalCopies || 0;
  }

  async countUniqueCategories(): Promise<number> {
    const categories = await Book.distinct('category');
    return categories.length;
  }
}
