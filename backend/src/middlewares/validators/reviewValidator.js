import { body, param } from 'express-validator';
import { handleValidationErrors } from './validationHandler.js';

export const reviewIdValidator = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID format.'),
  handleValidationErrors,
];

export const upsertReviewValidator = [
  // En azından 'rating' veya 'text' alanlarından birinin gönderildiğini kontrol eder.
  body().custom((value, { req }) => {
    if (
      (req.body.rating === undefined || req.body.rating === null) &&
      !req.body.text
    ) {
      throw new Error('A review must have at least a rating or a text.');
    }
    return true;
  }),

  // Eğer 'rating' alanı gönderilmişse, geçerli bir sayı olup olmadığını kontrol eder.
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 10 })
    .withMessage('Rating must be a number between 1 and 10.'),

  // Eğer 'text' alanı gönderilmişse, geçerli bir string olup olmadığını kontrol eder.
  body('text')
    .optional()
    .isString()
    .withMessage('Review text must be a string.')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Review text cannot exceed 5000 characters.'),

  handleValidationErrors,
];
