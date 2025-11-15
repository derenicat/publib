import express from 'express';
import {
  getMe,
  updateMyData,
  updateMyPassword,
  deleteMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Public Routes ---
// This route is for getting all users and is public.
router.get('/', getAllUsers);

// --- Protected User-Specific Routes ---
// These routes are for the currently logged-in user.
// They are placed before the dynamic '/:id' route to ensure they are matched first.
router.get('/me', protect, getMe, getUserById);
router.patch('/update-my-password', protect, updateMyPassword);
router.patch('/me', protect, updateMyData);
router.delete('/me', protect, deleteMe);

// --- Admin and Public Dynamic Routes ---
// These routes handle operations based on a user ID provided in the URL.
router
  .route('/:id')
  .get(getUserById) // Public: Anyone can get a user's public profile by their ID.
  .patch(protect, restrictTo('admin'), updateUser) // Protected: Only admins can update a user.
  .delete(protect, restrictTo('admin'), deleteUser); // Protected: Only admins can delete a user.

export default router;
