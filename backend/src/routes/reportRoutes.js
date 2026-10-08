import { Router } from 'express';
import { exportCsv, reportSchema, salesSummary } from '../controllers/reportController.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
const router = Router();
router.use(authMiddleware, requireRole('ADMIN'));
router.get('/sales-summary', validate(reportSchema), salesSummary);
router.get('/export-csv', validate(reportSchema), exportCsv);
export default router;
