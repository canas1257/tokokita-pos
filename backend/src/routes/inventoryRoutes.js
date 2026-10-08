import { Router } from 'express';
import { stockIn, stockInSchema } from '../controllers/inventoryController.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
const router = Router();
router.post('/stock-in', authMiddleware, requireRole('ADMIN'), validate(stockInSchema), stockIn);
export default router;
