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

// User registration route
// POST /api/auth/register
router.post('/register', registerValidator, register);

// User login route
// POST /api/auth/login
router.post('/login', loginValidator, login);

// User logout route
// POST /api/auth/logout
router.post('/logout', protect, logout);

// Forgot password route
// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// Reset password route
// PATCH /api/auth/reset-password/:token
router.patch('/reset-password/:token', resetPassword);

export default router;
