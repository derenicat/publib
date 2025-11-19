import { body } from 'express-validator';
import { handleValidationErrors } from './validationHandler.js';

export const registerValidator = [
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('username').notEmpty().withMessage('Username cannot be empty.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('passwordConfirm')
    .notEmpty()
    .withMessage('Please confirm your password.'),
  handleValidationErrors,
];

export const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password').notEmpty().withMessage('Password cannot be empty.'),
  handleValidationErrors,
];
