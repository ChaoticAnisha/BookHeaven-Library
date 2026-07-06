import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService';
import { AuthRequest } from '../middleware/auth';

const paymentService = new PaymentService();

export class PaymentController {
  async initiateKhalti(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const { rentalId, amount } = req.body;
      const customerInfo = {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '9800000000',
      };
      const result = await paymentService.initiateKhaltiPayment(req.user._id.toString(), rentalId, amount, customerInfo);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async verifyKhalti(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pidx } = req.body;
      const payment = await paymentService.verifyKhaltiPayment(pidx);
      res.json({ success: true, message: 'Payment verified', data: payment });
    } catch (error) { next(error); }
  }

  async initiateEsewa(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const { rentalId, amount } = req.body;
      const result = await paymentService.initiateEsewaPayment(req.user._id.toString(), rentalId, amount);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async verifyEsewa(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data } = req.body;
      const payment = await paymentService.verifyEsewaPayment(data);
      res.json({ success: true, message: 'eSewa payment verified', data: payment });
    } catch (error) { next(error); }
  }

  async initiateCard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const { rentalId, amount } = req.body;
      const payment = await paymentService.initiateCardPayment(req.user._id.toString(), rentalId, amount);
      res.json({ success: true, message: 'Card payment completed', data: payment });
    } catch (error) { next(error); }
  }

  async initiateCredit(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const { rentalId, amount } = req.body;
      const payment = await paymentService.initiateCreditPayment(req.user._id.toString(), rentalId, amount);
      res.json({ success: true, message: 'Payment deferred to credit', data: payment });
    } catch (error) { next(error); }
  }

  async getPendingPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const payments = await paymentService.getPendingPayments(req.user._id.toString());
      res.json({ success: true, data: payments });
    } catch (error) { next(error); }
  }

  async getUserPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const payments = await paymentService.getUserPayments(req.user._id.toString());
      res.json({ success: true, data: payments });
    } catch (error) { next(error); }
  }
}
