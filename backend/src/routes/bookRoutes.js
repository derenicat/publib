import express from 'express';
import {
  getAllBooks,
  getBook,
  searchBooks,
  aliasTopBooks,
} from '../controllers/bookController.js';

const router = express.Router();

router.route('/search').get(searchBooks);

router.route('/top-5').get(aliasTopBooks, getAllBooks);

router.route('/').get(getAllBooks);

router.route('/:identifier').get(getBook);

export default router;
