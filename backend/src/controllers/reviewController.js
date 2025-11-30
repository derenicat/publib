import * as reviewService from '../services/reviewService.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllReviews = catchAsync(async (req, res, next) => {
  // Filtreleme artık sorgu parametrelerine göre servis tarafından yapılıyor
  const reviews = await reviewService.getAllReviews(req.query);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

export const createReview = catchAsync(async (req, res, next) => {
  // Düz kaynak modelinde, öğe bilgisi gövdeden (body) gelmelidir
  const { item, itemModel, rating, text } = req.body;
  const userId = req.user.id;

  const newReview = await reviewService.createReview({
    userId,
    item,
    itemModel,
    rating,
    text,
  });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

export const getReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.getReviewById(req.params.reviewId);
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export const updateReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  const { rating, text } = req.body;

  const updatedReview = await reviewService.updateReview(reviewId, userId, {
    rating,
    text,
  });

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  await reviewService.deleteReview(reviewId, userId);

  res.status(204).send();
});
