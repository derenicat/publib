import * as movieRepository from '../repositories/movieRepository.js';
import * as tmdbService from "./tmdbService.js";
import { isMongoId } from "../utils/idValidator.js";
import AppError from "../utils/appError.js";

// FİLM VARLIĞINI SAĞLAMA (GET-OR-CREATE CACHING):
// Bir filmin yerel veritabanında olup olmadığını kontrol eder.
// Gelen ID'nin formatına göre akıllıca işlem yapar.
// Eğer film yoksa, TMDB API'den getirir ve veritabanına kaydeder.
export const ensureMovieExists = async (identifier) => {
  // If the identifier is a valid MongoID, find by that.
  if (isMongoId(identifier)) {
    const movie = await movieRepository.findById(identifier);
    if (!movie) {
      throw new AppError(
        'No movie found with that ID in our database.',
        404
      );
    }
    return movie;
  }

  // Otherwise, assume it's a tmdbId and perform get-or-create.
  let movie = await movieRepository.findByTmdbId(identifier);
  if (movie) {
    return movie;
  }

  // If not in our DB, fetch from TMDB
  const tmdbMovie = await tmdbService.getMovieDetails(identifier);
  if (!tmdbMovie) {
    throw new AppError('No movie found with that ID on TMDB.', 404);
  }

  // The 'tmdbMovie' is already mapped to our schema by the tmdbService
  movie = await movieRepository.create(tmdbMovie);

  return movie;
};

// HİBRİT ARAMA MEKANİZMASI (HYBRID SEARCH):
// Kullanıcının arama sorgusunu TMDB API'de yürütür ve dönen sonuçları
// yerel veritabanımızdaki mevcut film bilgileriyle zenginleştirir.
export const searchMovies = async queryParams => {
  const { q, page } = queryParams;
  if (!q) {
    throw new AppError("A search query (q) is required.", 400);
  }

  // 1. Ana sonuçları TMDB API'den getir
  const tmdbData = await tmdbService.searchMovies(q, page);
  const { results: tmdbMovies, totalPages, totalResults } = tmdbData;

  if (!tmdbMovies || tmdbMovies.length === 0) {
    return { results: [], totalPages: 0, totalResults: 0 };
  }

  // 2. TMDB ID'lerini topla
  const tmdbIds = tmdbMovies.map(movie => movie.tmdbId);

  // 3. Zenginleştirme verilerini yerel veritabanından TMDB ID'lerini kullanarak getir
  const localMovies = await movieRepository.findManyByTmdbIds(tmdbIds);
  const localMoviesMap = new Map(
    localMovies.map(movie => [movie.tmdbId, movie])
  );

  // 4. TMDB sonuçlarını yerel verilerle zenginleştir
  const enrichedMovies = tmdbMovies.map(movie => {
    const localMovie = localMoviesMap.get(movie.tmdbId);
    return {
      ...movie,
      isEnriched: !!localMovie,
      detailPageId: localMovie ? localMovie._id : movie.tmdbId,
    };
  });

  return {
    results: enrichedMovies,
    totalPages,
    totalResults,
  };
};

// YEREL FİLMLERİ KEŞFETME AKIŞI (DISCOVER FLOW):
// Filmleri sadece yerel veritabanımızdan APIFeatures kullanarak getirir.
export const getAllMovies = async queryParams => {
  // Bu fonksiyon, repository katmanı içinde APIFeatures'ı kullanacak
  return movieRepository.findAll(queryParams);
};

// AKILLI FİLM DETAY SERVİSİ (SMART MOVIE DETAIL SERVICE):
// Gelen ID'nin MongoDB _id mi yoksa TMDB ID mi olduğunu ayırt eder.
// Eğer TMDB ID ise, `ensureMovieExists` aracılığıyla get-or-create mantığını tetikler.
export const getMovieDetails = async id => {
  if (isMongoId(id)) {
    const movie = await movieRepository.findById(id);
    if (!movie) {
      throw new AppError("No movie found with that ID in our database.", 404);
    }
    return movie;
  }
  // Eğer bir MongoID değilse, tmdbId olduğunu varsay ve varlığını sağla
  return ensureMovieExists(id);
};
