import { body, param } from 'express-validator';
import { handleValidationErrors } from './validationHandler.js';
import { UserList } from '../../models/index.js';

export const createListValidator = [
  body('name')
    .notEmpty()
    .withMessage('List name is required.')
    .isString()
    .withMessage('List name must be a string.')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('List name must be between 1 and 50 characters long.'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string.')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters.'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean.'),
  handleValidationErrors,
];

export const addEntryValidator = [
  body('googleBooksId')
    .notEmpty()
    .withMessage('Google Books ID is required.')
    .isString()
    .withMessage('Google Books ID must be a string.'),
  body('listName')
    .optional() 
    .isString()
    .withMessage('List name must be a string.')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('List name must be between 1 and 50 characters long.'),
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .isIn(['READ', 'READING', 'WANT_TO_READ'])
    .withMessage('Status must be one of: READ, READING, WANT_TO_READ.'),
  handleValidationErrors,
];

export const listIdValidator = [
  param('listId')
    .isMongoId()
    .withMessage('Invalid list ID format.'),
  handleValidationErrors,
];

export const entryIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid entry ID format.'),
  handleValidationErrors,
];
