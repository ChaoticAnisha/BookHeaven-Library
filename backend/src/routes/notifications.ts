import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new NotificationController();

router.get('/', authenticate, (req, res, next) => ctrl.getNotifications(req, res, next));
router.get('/unread-count', authenticate, (req, res, next) => ctrl.getUnreadCount(req, res, next));
router.put('/read-all', authenticate, (req, res, next) => ctrl.markAllRead(req, res, next));
router.put('/:id/read', authenticate, (req, res, next) => ctrl.markRead(req, res, next));

export default router;
