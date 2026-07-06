import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const ctrl = new UserController();

router.get('/profile', authenticate, (req, res, next) => ctrl.getProfile(req, res, next));
router.put('/profile', authenticate, (req, res, next) => ctrl.updateProfile(req, res, next));
router.put('/notifications', authenticate, (req, res, next) => ctrl.updateNotifications(req, res, next));
router.get('/reading-history', authenticate, (req, res, next) => ctrl.getReadingHistory(req, res, next));
router.get('/dashboard-stats', authenticate, (req, res, next) => ctrl.getDashboardStats(req, res, next));
router.get('/wishlist', authenticate, (req, res, next) => ctrl.getWishlist(req, res, next));
router.post('/wishlist/:bookId', authenticate, (req, res, next) => ctrl.addToWishlist(req, res, next));
router.delete('/wishlist/:bookId', authenticate, (req, res, next) => ctrl.removeFromWishlist(req, res, next));

// Admin only
router.get('/all', authenticate, authorize('admin'), (req, res, next) => ctrl.getAllUsers(req, res, next));
router.get('/stats', authenticate, authorize('admin'), (req, res, next) => ctrl.getUserStats(req, res, next));
router.patch('/:id/suspend', authenticate, authorize('admin'), (req, res, next) => ctrl.suspendUser(req, res, next));
router.delete('/:id', authenticate, authorize('admin'), (req, res, next) => ctrl.deleteUser(req, res, next));

export default router;
