import express from 'express';
import { addEntry, getEntriesByList, removeEntry } from '../controllers/libraryEntryController.js';
import { protect, checkOwnership } from '../middlewares/authMiddleware.js';
import { addEntryValidator, entryIdValidator, listIdValidator } from '../middlewares/validators/libraryValidator.js';
import { LibraryEntry } from '../models/index.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(addEntryValidator, addEntry);

router.route('/list/:listId')
  .get(listIdValidator, getEntriesByList);

router.route('/:id')
  .delete(entryIdValidator, checkOwnership(LibraryEntry), removeEntry);

export default router;
