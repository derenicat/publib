import express from 'express';
import {
  getAllMovies,
  getMovie,
  searchMovies,
  aliasTopMovies,
  aliasMostPopularMovies,
} from '../controllers/movieController.js';

const router = express.Router();

router.route('/search').get(searchMovies);

router.route('/top-5').get(aliasTopMovies, getAllMovies);

router.route('/most-popular').get(aliasMostPopularMovies, getAllMovies);

router.route('/').get(getAllMovies);

router.route('/:identifier').get(getMovie);

export default router;