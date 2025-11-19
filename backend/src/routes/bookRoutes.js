import express from 'express';
import {
  getAllBooks,
  getBook,
  searchBooks,
} from '../controllers/bookController.js';

const router = express.Router();

router.route('/search').get(searchBooks);

router.route('/').get(getAllBooks);

router.route('/:id').get(getBook);

export default router;