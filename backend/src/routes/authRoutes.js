import express from 'express';
import authController from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../middlewares/validators/authValidator.js';

const router = express.Router();

// User registration route
// POST /api/auth/register
router.post('/register', registerValidator, authController.register);

// User login route
// POST /api/auth/login
router.post('/login', loginValidator, authController.login);

// User logout route
// POST /api/auth/logout
router.post('/logout', authController.logout);

// Forgot password route
// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// Reset password route
// PATCH /api/auth/reset-password/:token
router.patch('/reset-password/:token', authController.resetPassword);

export default router;
