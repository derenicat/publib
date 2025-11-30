import express from 'express';
import {
  getGlobalFeed,
  getPersonalFeed,
  getSocialFeed,
  likeActivity,
  commentOnActivity,
  deleteCommentOnActivity,
} from '../controllers/activityController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { userIdValidator } from '../middlewares/validators/userValidator.js';

const router = express.Router();

// Herkese açık global akış (platform genelindeki en son aktiviteler)
router.get('/', getGlobalFeed);

// --- Kimliği Doğrulanmış Rotlar ---
router.use(protect); // Tüm sonraki rotalar kimlik doğrulaması gerektirir.

// Giriş yapmış kullanıcı için kişisel akış
router.get('/me', getPersonalFeed);

// Sosyal akış (giriş yapmış kullanıcının takip ettiği kullanıcıların aktiviteleri)
router.get('/social', getSocialFeed);

// Belirli bir kullanıcı için kişisel akış (korumalı - sadece admin veya ilgili kullanıcı görebilmeli, şimdilik korumalı)
router.get('/users/:userId', userIdValidator, getPersonalFeed);

// Aktivite Etkileşim Rotaları
router.post('/:id/like', likeActivity);
router.post('/:id/comments', commentOnActivity);
router.delete('/:id/comments/:commentId', deleteCommentOnActivity);

export default router;