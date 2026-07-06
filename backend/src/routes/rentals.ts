import { Router } from 'express';
import { RentalController } from '../controllers/RentalController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { rentalSchema, returnSchema, cancelSchema } from '../utils/validators';

const router = Router();
const ctrl = new RentalController();

router.post('/', authenticate, validate(rentalSchema), (req, res, next) => ctrl.rentBook(req, res, next));
router.post('/return', authenticate, validate(returnSchema), (req, res, next) => ctrl.returnBook(req, res, next));
router.post('/cancel', authenticate, validate(cancelSchema), (req, res, next) => ctrl.cancelRental(req, res, next));
router.get('/my', authenticate, (req, res, next) => ctrl.getUserRentals(req, res, next));
router.get('/all', authenticate, authorize('admin', 'librarian'), (req, res, next) => ctrl.getAllRentals(req, res, next));
router.get('/stats', authenticate, authorize('admin', 'librarian'), (req, res, next) => ctrl.getRentalStats(req, res, next));

export default router;
