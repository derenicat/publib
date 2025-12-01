import api from './api';

const userListService = {
  // Oturum açmış kullanıcının listelerini getir (Public & Private)
  getMyLists: async () => {
    const response = await api.get('/lists/me');
    // Beklenen yanıt: { status: 'success', data: { lists: [...] } }
    return response.data;
  },

  // Belirli bir kullanıcının herkese açık listelerini getir
  getUserLists: async (userId) => {
    const response = await api.get(`/lists/user/${userId}`);
    return response.data;
  },

  // Tek bir listenin detaylarını getir
  getList: async (listId) => {
    const response = await api.get(`/lists/${listId}`);
    return response.data;
  },

  // Yeni liste oluştur
  createList: async (listData) => {
    // listData: { name, description, type, isPublic }
    const response = await api.post('/lists', listData);
    return response.data;
  },

  // Listeyi güncelle
  updateList: async (listId, listData) => {
    // listData: { name, description, isPublic }
    const response = await api.patch(`/lists/${listId}`, listData);
    return response.data;
  },

  // Listeyi sil
  deleteList: async (listId) => {
    const response = await api.delete(`/lists/${listId}`);
    return response.data;
  }
};

export default userListService;
