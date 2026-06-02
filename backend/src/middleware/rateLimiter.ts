import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/config';

const bypassLimiter = (req: Request, res: Response, next: NextFunction) => next();

const isDevOrTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

export const authRateLimiter = isDevOrTest ? bypassLimiter : rateLimit({
  windowMs: config.rateLimits.auth.windowMs,
  max: config.rateLimits.auth.max,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimiter = isDevOrTest ? bypassLimiter : rateLimit({
  windowMs: config.rateLimits.general.windowMs,
  max: config.rateLimits.general.max,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
