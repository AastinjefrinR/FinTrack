import express from 'express';
import { getInsightsAndHealthScore } from '../controllers/insightsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getInsightsAndHealthScore);

export default router;
