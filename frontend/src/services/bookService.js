import api from './api';

const bookService = {
  // Google Books üzerinden arama yap (Hybrid Search)
  searchBooks: async (query, page = 1) => {
    const response = await api.get('/books/search', {
      params: { q: query, page }
    });
    // Backend yanıtı: { status: 'success', data: { books: [...] }, ... }
    return response.data;
  },

  // Yerel veritabanındaki kitapları getir (Discover)
  getBooks: async (params) => {
    const response = await api.get('/books', { params });
    return response.data;
  },

  getTopRated: async () => {
    const response = await api.get('/books/top-5');
    return response.data;
  },

  getMostPopular: async () => {
    const response = await api.get('/books/most-popular');
    return response.data;
  },

  // Kitap detayını getir
  getBookDetails: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  }
};

export default bookService;
