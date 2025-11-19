import axios from 'axios';
import AppError from '../utils/appError.js';
import config from '../config/env.js';

const apiKey = config.TMDB_API_KEY;
const baseUrl = config.TMDB_API_URL;

// Genre'ler için hafıza önbelleği
let genreMap = null;

// TMDB'den genre listesini çeken ve önbelleğe alan yardımcı fonksiyon
const getGenreMap = async () => {
  if (genreMap) {
    return genreMap;
  }

  try {
    const response = await axios.get(`${baseUrl}/genre/movie/list`, {
      params: {
        api_key: apiKey,
      },
    });
    // Hızlı arama için { id: name } formatına dönüştürüyoruz
    genreMap = response.data.genres.reduce((map, genre) => {
      map[genre.id] = genre.name;
      return map;
    }, {});
    console.log('TMDB Genre map fetched and cached.');
    return genreMap;
  } catch (error) {
    console.error('Error fetching TMDB genre list:', error.message);
    throw new AppError('Could not fetch TMDB genre list.', 500);
  }
};

// TMDB'den gelen ham genre verisini (detay endpoint'inden gelen obje dizisi) işler
const processGenres = (rawGenres) => {
  if (!rawGenres || rawGenres.length === 0) {
    return [];
  }
  return rawGenres.map((genre) => genre.name);
};

// Bir TMDB film objesini (tam detaylar) kendi dahili film şemamıza mapler.
const mapTmdbMovieToOurSchema = (tmdbMovie) => {
  if (!tmdbMovie) return null;

  return {
    tmdbId: String(tmdbMovie.id),
    title: tmdbMovie.title,
    overview: tmdbMovie.overview,
    posterPath: tmdbMovie.poster_path,
    backdropPath: tmdbMovie.backdrop_path,
    releaseDate: tmdbMovie.release_date,
    genres: processGenres(tmdbMovie.genres),
  };
};

// TMDB API'sinde film arar.
export const searchMovies = async (query, page = 1) => {
  if (!apiKey || !baseUrl) {
    throw new AppError('TMDB API key or URL is not configured.', 500);
  }
  if (!query) {
    throw new AppError('Search query cannot be empty.', 400);
  }

  try {
    const response = await axios.get(`${baseUrl}/search/movie`, {
      params: {
        api_key: apiKey,
        query: query,
        page: page,
      },
    });

    const { results, total_pages, total_results } = response.data;
    const currentGenreMap = await getGenreMap();

    const mappedResults = results.map((movie) => ({
      tmdbId: String(movie.id),
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date,
      // genre_ids'leri önbellekteki genreMap'i kullanarak isimlere dönüştür
      genres: movie.genre_ids
        ? movie.genre_ids.map((id) => currentGenreMap[id]).filter(Boolean)
        : [],
    }));

    return {
      results: mappedResults,
      totalPages: total_pages,
      totalResults: total_results,
    };
  } catch (error) {
    console.error('Error searching movies on TMDB API:', error.message);
    throw new AppError(
      'Could not fetch movies from TMDB API.',
      error.response ? error.response.status : 500
    );
  }
};

export const getMovieDetails = async (tmdbId) => {
  if (!apiKey || !baseUrl) {
    throw new AppError('TMDB API key or URL is not configured.', 500);
  }

  try {
    const response = await axios.get(`${baseUrl}/movie/${tmdbId}`, {
      params: {
        api_key: apiKey,
      },
    });

    return mapTmdbMovieToOurSchema(response.data);
  } catch (error) {
    console.error(
      `Error fetching movie details for ID ${tmdbId} from TMDB API:`,
      error.message
    );
    throw new AppError(
      `Could not fetch movie with ID ${tmdbId} from TMDB API.`,
      error.response ? error.response.status : 500
    );
  }
};
