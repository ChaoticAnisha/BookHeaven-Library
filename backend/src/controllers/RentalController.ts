import { Response, NextFunction } from 'express';
import { RentalService } from '../services/RentalService';
import { AuthRequest } from '../middleware/auth';

const rentalService = new RentalService();

export class RentalController {
  async rentBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const { bookId, serialNumber, fromDate, toDate, purpose } = req.body;
      const rental = await rentalService.rentBook(req.user._id.toString(), bookId, serialNumber, fromDate, toDate, purpose);
      res.status(201).json({ success: true, message: 'Book rented successfully', data: rental });
    } catch (error) { next(error); }
  }

  async returnBook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const { rentalId, serialNumber } = req.body;
      const result = await rentalService.returnBook(rentalId, req.user._id.toString(), serialNumber);
      res.json({ success: true, message: 'Book returned successfully', data: result.rental });
    } catch (error) { next(error); }
  }

  async cancelRental(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const { rentalId } = req.body;
      const rental = await rentalService.cancelRental(rentalId, req.user._id.toString());
      res.json({ success: true, message: 'Rental cancelled', data: rental });
    } catch (error) { next(error); }
  }

  async getUserRentals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const rentals = await rentalService.getUserRentals(req.user._id.toString());
      res.json({ success: true, data: rentals });
    } catch (error) { next(error); }
  }

  async getAllRentals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '20' } = req.query as Record<string, string>;
      const result = await rentalService.getAllRentals(Number(page), Number(limit));
      res.json({ success: true, data: result.rentals });
    } catch (error) { next(error); }
  }

  async getRentalStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await rentalService.getRentalStats();
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  }
}
