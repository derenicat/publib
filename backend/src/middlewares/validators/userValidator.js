import { param } from 'express-validator';
import { handleValidationErrors } from './validationHandler.js';

export const userIdValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID format.'),
  handleValidationErrors,
];
