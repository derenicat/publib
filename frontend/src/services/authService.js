import api from './api';

const authService = {
  // Kayıt Ol
  register: async (userData) => {
    // userData: { username, email, password, passwordConfirm }
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Giriş Yap
  login: async (credentials) => {
    // credentials: { email, password }
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Çıkış Yap
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Mevcut Kullanıcıyı Getir (Session kontrolü için)
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Şifremi Unuttum
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Şifre Sıfırlama
  resetPassword: async (token, passwords) => {
    // passwords: { password, passwordConfirm }
    const response = await api.patch(`/auth/reset-password/${token}`, passwords);
    return response.data;
  }
};

export default authService;
