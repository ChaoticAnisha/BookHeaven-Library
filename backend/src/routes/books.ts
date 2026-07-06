import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { authenticate, authorize } from '../middleware/auth';
import { generalRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const ctrl = new BookController();

router.use(generalRateLimiter);

router.get('/search', (req, res, next) => ctrl.search(req, res, next));
router.get('/new-arrivals', (req, res, next) => ctrl.getNewArrivals(req, res, next));
router.get('/recommended', (req, res, next) => ctrl.getRecommended(req, res, next));
router.get('/stats', authenticate, authorize('admin'), (req, res, next) => ctrl.getStats(req, res, next));
router.get('/all', authenticate, (req, res, next) => ctrl.getAllBooks(req, res, next));
router.get('/similar/:id', (req, res, next) => ctrl.getSimilar(req, res, next));
router.get('/:id', (req, res, next) => ctrl.getById(req, res, next));

router.post('/', authenticate, authorize('admin'), (req, res, next) => ctrl.createBook(req, res, next));
router.put('/:id', authenticate, authorize('admin'), (req, res, next) => ctrl.updateBook(req, res, next));
router.delete('/:id', authenticate, authorize('admin'), (req, res, next) => ctrl.deleteBook(req, res, next));

export default router;
