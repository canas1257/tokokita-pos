import { Router } from 'express';
import { createOrder, getOrder, orderIdSchema, orderSchema } from '../controllers/orderController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
const router = Router();
router.use(authMiddleware);
router.post('/', validate(orderSchema), createOrder);
router.get('/:id', validate(orderIdSchema), getOrder);
export default router;
