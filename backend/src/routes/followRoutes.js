import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowStats,
  getMyFollowers,
  getMyFollowing,
} from '../controllers/followController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { userIdValidator } from '../middlewares/validators/userValidator.js';

const router = express.Router();

// --- "BEN" ROTALARI ---
// Genel /:userId rotalarından önce gelmelidir
router.get('/me/followers', protect, getMyFollowers);
router.get('/me/following', protect, getMyFollowing);

// --- GENEL KULLANICI TAKİP ROTALARI ---

// Başka bir kullanıcıyı takip etme/takibi bırakma için kimlik doğrulamalı rotalar
router.post('/:userId/follow', protect, userIdValidator, followUser);
router.delete('/:userId/follow', protect, userIdValidator, unfollowUser);

// Herhangi bir kullanıcının takip listelerini/istatistiklerini görüntülemek için genel rotalar
router.get('/:userId/followers', userIdValidator, getFollowers);
router.get('/:userId/following', userIdValidator, getFollowing);
router.get('/:userId/follow-stats', userIdValidator, getFollowStats);

export default router;
