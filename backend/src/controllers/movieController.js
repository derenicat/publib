import catchAsync from '../utils/catchAsync.js';
import * as movieService from '../services/movieService.js';

export const aliasTopMovies = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-averageRating,-ratingsCount';
  req.query.fields = 'title,posterPath,averageRating,releaseDate,detailPageId';
  next();
};

export const aliasMostPopularMovies = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsCount,-averageRating';
  req.query.fields = 'title,posterPath,averageRating,ratingsCount,releaseDate,detailPageId';
  next();
};

export const getAllMovies = catchAsync(async (req, res, next) => {
  // "Discover" akışı: Sadece yerel veritabanımızdaki mevcut filmleri listeler.
  console.log('getAllMovies controller called');
  const movies = await movieService.getAllMovies(req.query);

  res.status(200).json({
    status: 'success',
    results: movies.length,
    data: {
      movies,
    },
  });
});

export const searchMovies = catchAsync(async (req, res, next) => {
  // "Search" akışı: TMDB de arama yapar ve sonuçları yerel verilerle zenginleştirir.
  console.log('searchMovies controller called');
  const movies = await movieService.searchMovies(req.query);

  res.status(200).json({
    status: 'success',
    results: movies.results.length,
    data: {
      movies: movies.results,
      totalPages: movies.totalPages,
      totalResults: movies.totalResults,
    },
  });
});

export const getMovie = catchAsync(async (req, res, next) => {
  // "Smart" detail endpoint: ID'nin formatına göre veritabanından veya TMDB'den film detayını getirir.
  console.log('getMovie controller called');
  const movie = await movieService.getMovieDetails(req.params.identifier);

  res.status(200).json({
    status: 'success',
    data: {
      movie,
    },
  });
});