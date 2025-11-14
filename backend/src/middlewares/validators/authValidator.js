import { body, validationResult } from 'express-validator';
import AppError from '../../utils/appError.js';

// A helper middleware that catches and handles validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // We can format the errors to be more readable
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join('. ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};

// Validation rules for the register endpoint
export const registerValidator = [
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('username').notEmpty().withMessage('Username cannot be empty.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('passwordConfirm')
    .notEmpty()
    .withMessage('Please confirm your password.'),
  handleValidationErrors, // Run the error check after the rules
];

// Validation rules for the login endpoint
export const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password').notEmpty().withMessage('Password cannot be empty.'),
  handleValidationErrors,
];
