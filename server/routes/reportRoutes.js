import express from 'express';
import {
  getDashboardSummary,
  getDetailedAnalytics,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/analytics', getDetailedAnalytics);

export default router;
