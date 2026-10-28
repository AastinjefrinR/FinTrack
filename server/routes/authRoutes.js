import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  seedDemo,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/seed-demo', protect, seedDemo);

export default router;
