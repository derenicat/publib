import express from 'express';
import {
  getAllMovies,
  getMovie,
  searchMovies,
} from '../controllers/movieController.js';

const router = express.Router();

router.route('/search').get(searchMovies);

router.route('/').get(getAllMovies);

router.route('/:id').get(getMovie);

export default router;