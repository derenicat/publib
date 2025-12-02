import api from './api';

const activityService = {
  // Tüm platformdaki genel aktivite akışını getir
  getGlobalFeed: async (params) => {
    const response = await api.get('/feed', { params });
    return response.data;
  },

  // Oturum açmış kullanıcının kişisel aktivite akışını getir
  getPersonalFeed: async (params) => {
    const response = await api.get('/feed/me', { params });
    return response.data;
  },

  // Takip edilen kullanıcıların sosyal aktivite akışını getir
  getSocialFeed: async (params) => {
    const response = await api.get('/feed/social', { params });
    return response.data;
  },

  // Belirli bir kullanıcıya ait aktivite akışını getir (public)
  getUserFeed: async (userId, params) => {
    const response = await api.get(`/feed/users/${userId}`, { params });
    return response.data;
  },

  // Bir aktiviteye beğeni ekle/kaldır
  toggleLike: async (activityId) => {
    const response = await api.post(`/feed/${activityId}/like`);
    return response.data;
  },

  // Bir aktiviteye yorum ekle
  addComment: async (activityId, text) => {
    const response = await api.post(`/feed/${activityId}/comments`, { text });
    return response.data;
  },

  // Bir aktivitedeki yorumu sil
  deleteComment: async (activityId, commentId) => {
    const response = await api.delete(`/feed/${activityId}/comments/${commentId}`);
    return response.data;
  }
};

export default activityService;
