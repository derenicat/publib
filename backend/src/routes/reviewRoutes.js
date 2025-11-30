import express from 'express';
import {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';
import {
  upsertReviewValidator,
  reviewIdValidator,
} from '../middlewares/validators/reviewValidator.js';

// Bu artık üst düzey bir yönlendiricidir
const router = express.Router();

// GET /api/reviews - Tüm yorumları getir (sorgu parametreleri ile filtrelenebilir)
// POST /api/reviews - Yeni bir yorum oluştur
router
  .route('/')
  .get(getAllReviews)
  .post(protect, upsertReviewValidator, createReview);

// GET /api/reviews/:reviewId - Tek bir yorumu getir
// PATCH /api/reviews/:reviewId - Bir yorumu güncelle
// DELETE /api/reviews/:reviewId - Bir yorumu sil
router
  .route('/:reviewId')
  .get(reviewIdValidator, getReview)
  .patch(protect, reviewIdValidator, upsertReviewValidator, updateReview)
  .delete(protect, reviewIdValidator, deleteReview);

export default router;
