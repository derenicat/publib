import { body, param } from 'express-validator';
import { handleValidationErrors } from './validationHandler.js';
import { UserList } from '../../models/index.js';
import { BOOK_STATUSES, MOVIE_STATUSES } from '../../models/libraryEntryModel.js';

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
  body('type')
    .notEmpty()
    .withMessage('List type is required.')
    .isIn(['Book', 'Movie'])
    .withMessage('List type must be either "Book" or "Movie".'),
  handleValidationErrors,
];

export const addEntryValidator = [
  body('item')
    .notEmpty()
    .withMessage('Item ID is required.')
    .isString()
    .withMessage('Item ID must be a string.'),
  body('itemModel')
    .notEmpty()
    .withMessage('itemModel is required.')
    .isIn(['Book', 'Movie'])
    .withMessage('itemModel must be either "Book" or "Movie".'),
  body('list')
    .notEmpty()
    .withMessage('List ID is required.')
    .isMongoId()
    .withMessage('Invalid List ID format.'),
  body('status')
    .notEmpty()
    .withMessage('Status is required.')
    .custom((value, { req }) => {
      const { itemModel } = req.body;
      let validStatuses = [];

      if (itemModel === 'Book') {
        validStatuses = BOOK_STATUSES;
      } else if (itemModel === 'Movie') {
        validStatuses = MOVIE_STATUSES;
      } else {
        return false;
      }

      if (!validStatuses.includes(value)) {
        throw new Error(
          `Invalid status for ${itemModel}. Must be one of: ${validStatuses.join(
            ', '
          )}`
        );
      }
      return true;
    }),
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
