import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import { registerSchema, loginSchema } from '../utils/validators';

const router = Router();
const ctrl = new AuthController();

router.post('/register', authRateLimiter, validate(registerSchema), (req, res, next) => ctrl.register(req, res, next));
router.post('/login', authRateLimiter, validate(loginSchema), (req, res, next) => ctrl.login(req, res, next));
router.get('/profile', authenticate, (req, res, next) => ctrl.getProfile(req, res, next));
router.post('/logout', authenticate, (req, res) => ctrl.logout(req, res));

export default router;
