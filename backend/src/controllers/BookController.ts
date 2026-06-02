import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/BookService';
import { AuthRequest } from '../middleware/auth';

const bookService = new BookService();

export class BookController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, filter, genre, category, page = '1', limit = '12' } = req.query as Record<string, string>;
      const result = await bookService.search(
        { search: q, searchField: filter, genre: genre || category },
        Number(page), Number(limit)
      );
      res.json({
        success: true,
        data: {
          books: result.books,
          total: result.total,
          pages: result.pages,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: result.total,
            pages: result.pages,
          }
        }
      });
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const book = await bookService.getById(req.params.id);
      res.json({ success: true, data: book });
    } catch (error) { next(error); }
  }

  async getNewArrivals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = '12' } = req.query as { limit?: string };
      const books = await bookService.getNewArrivals(Number(limit));
      res.json({ success: true, data: books });
    } catch (error) { next(error); }
  }

  async getRecommended(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categories = '' } = req.query as { categories?: string };
      const cats = categories ? categories.split(',') : [];
      const books = await bookService.getRecommended(cats);
      res.json({ success: true, data: books });
    } catch (error) { next(error); }
  }

  async createBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const book = await bookService.createBook(req.body);
      res.status(201).json({ success: true, message: 'Book created', data: book });
    } catch (error) { next(error); }
  }

  async updateBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const book = await bookService.updateBook(req.params.id, req.body);
      res.json({ success: true, message: 'Book updated', data: book });
    } catch (error) { next(error); }
  }

  async deleteBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await bookService.deleteBook(req.params.id);
      res.json({ success: true, message: 'Book deleted' });
    } catch (error) { next(error); }
  }

  async getAllBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20' } = req.query as Record<string, string>;
      const result = await bookService.getAllBooks(Number(page), Number(limit));
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await bookService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }
}
