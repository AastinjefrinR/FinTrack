import express from 'express';
import {
  getGoals,
  createGoal,
  addContribution,
  updateGoal,
  deleteGoal,
} from '../controllers/savingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.post('/:id/contribute', addContribution);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

export default router;
