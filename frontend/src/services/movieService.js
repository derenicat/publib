import api from './api';

const movieService = {
  // TMDB üzerinden arama yap (Hybrid Search)
  searchMovies: async (query, page = 1) => {
    const response = await api.get('/movies/search', {
      params: { q: query, page }
    });
    return response.data;
  },

  // Yerel veritabanındaki filmleri getir (Discover)
  getMovies: async (params) => {
    const response = await api.get('/movies', { params });
    return response.data;
  },

  getTopRated: async () => {
    const response = await api.get('/movies/top-5');
    return response.data;
  },

  // Film detayını getir
  getMovieDetails: async (id) => {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  }
};

export default movieService;
