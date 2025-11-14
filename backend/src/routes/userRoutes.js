import express from 'express';
import {
  getMe,
  updateMyData,
  updateMyPassword,
  deleteMe,
  getAllUsers,
  getUserById,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Public User Routes --- //
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// All routes after this middleware are protected
router.use(protect);

// Route to get, update, and delete user profile information (excluding password)
router.route('/me').get(getMe).patch(updateMyData).delete(deleteMe);

// Route to update the user's password
router.patch('/update-my-password', updateMyPassword);

// --- Library and List Routes --- //
// These will be implemented later

router.route('/me/library/books').get().post();
router.route('/me/library/books/:id').patch().delete();
router.route('/me/library/movies').get().post();
router.route('/me/library/movies/:id').patch().delete();
router.route('/me/lists').get().post();
router.route('/me/lists/:id').get().patch().delete();
router.route('/me/lists/:id/items').post();
router.route('/me/lists/:id/items/:itemId').delete();

export default router;
