import { Router } from 'express';
import { getProducts, priceSchema, updatePrice } from '../controllers/productController.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
const router = Router();
router.use(authMiddleware);
router.get('/', getProducts);
router.patch('/:id/price', requireRole('ADMIN'), validate(priceSchema), updatePrice);
export default router;
