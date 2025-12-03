import api from './api';

const userService = {
  // Belirli bir kullanıcının profilini getir (ID ile)
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Takipçi ve Takip Edilen sayılarını getir
  getFollowStats: async (userId) => {
    const response = await api.get(`/users/${userId}/follow-stats`);
    // Beklenen yanıt: { status: 'success', data: { followersCount, followingCount } }
    return response.data;
  },

  // Kullanıcının takipçilerini getir
  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  // Kullanıcının takip ettiklerini getir
  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },

  // Bir kullanıcıyı takip et
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Takipten çık
  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  // Profil bilgilerini güncelle (Bio, Avatar vb.)
  updateProfile: async (userData) => {
    const response = await api.patch('/users/me', userData);
    return response.data;
  },

  // Kullanıcı adı ile arama yap
  searchUsers: async (username) => {
    const response = await api.get(`/users`, { params: { username } });
    return response.data;
  }
};

export default userService;
