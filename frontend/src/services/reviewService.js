import api from './api';

const reviewService = {
  // Yeni yorum oluştur
  createReview: async (reviewData) => {
    // reviewData: { item, itemModel, rating, text }
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Bir öğeye ait tüm yorumları getir
  getItemReviews: async (itemId, itemModel) => {
    const response = await api.get('/reviews', {
      params: { item: itemId, itemModel }
    });
    return response.data;
  },

  // Bir kullanıcının tüm yorumlarını getir (profildeki 'Reviews' sekmesi için)
  getUserReviews: async (userId) => {
    const response = await api.get('/reviews', {
      params: { user: userId }
    });
    return response.data;
  },

  // Tek bir yorumu ID'sine göre getir
  getReviewById: async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  },

  // Yorumu güncelle
  updateReview: async (reviewId, reviewData) => {
    // reviewData: { rating, text }
    const response = await api.patch(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Yorumu sil
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

export default reviewService;
