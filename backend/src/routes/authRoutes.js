import { Router } from 'express';
import { login, loginSchema } from '../controllers/authController.js';
import { validate } from '../middlewares/validationMiddleware.js';
const router = Router();
router.post('/login', validate(loginSchema), login);
export default router;
