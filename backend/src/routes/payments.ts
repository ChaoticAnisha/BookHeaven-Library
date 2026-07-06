import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new PaymentController();

router.post('/khalti/initiate', authenticate, (req, res, next) => ctrl.initiateKhalti(req, res, next));
router.post('/khalti/verify', authenticate, (req, res, next) => ctrl.verifyKhalti(req, res, next));
router.post('/esewa/initiate', authenticate, (req, res, next) => ctrl.initiateEsewa(req, res, next));
router.post('/esewa/verify', authenticate, (req, res, next) => ctrl.verifyEsewa(req, res, next));
router.post('/card', authenticate, (req, res, next) => ctrl.initiateCard(req, res, next));
router.post('/credit', authenticate, (req, res, next) => ctrl.initiateCredit(req, res, next));
router.get('/pending', authenticate, (req, res, next) => ctrl.getPendingPayments(req, res, next));
router.get('/history', authenticate, (req, res, next) => ctrl.getUserPayments(req, res, next));

export default router;
