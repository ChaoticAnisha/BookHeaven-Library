import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, message: 'Registered successfully', data: result });
    } catch (error) { next(error); }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ success: true, message: 'Login successful', data: result });
    } catch (error) { next(error); }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as Request & { user?: { _id: { toString: () => string } } }).user;
      if (!user) { res.status(401).json({ success: false, message: 'Not authenticated' }); return; }
      const profile = await authService.getProfile(user._id.toString());
      res.json({ success: true, data: profile });
    } catch (error) { next(error); }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Logged out successfully' });
  }
}
