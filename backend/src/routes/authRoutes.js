import express from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { registerValidator, loginValidator } from '../middlewares/validators/authValidator.js';

const router = express.Router();

router.post('/register', registerValidator, register);

router.post('/login', loginValidator, login);

router.post('/logout', protect, logout);

router.post('/forgot-password', forgotPassword);

router.patch('/reset-password/:token', resetPassword);

export default router;
