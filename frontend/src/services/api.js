import axios from 'axios';

// Ortam değişkeninden API URL'ini alalım, yoksa varsayılan olarak localhost:3000 kullanalım
// Vite projelerinde environment variable'lar import.meta.env üzerinden erişilir
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ÇOK ÖNEMLİ: HttpOnly cookie'lerin gönderilmesi için gerekli
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor (İsteğe bağlı ama önerilir)
// Backend'den dönen hataları merkezi bir yerde yakalamak için
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Örneğin: 401 Unauthorized hatası gelirse kullanıcıyı login sayfasına yönlendirebiliriz
    // Şimdilik sadece hatayı fırlatıyoruz
    const message = error.response?.data?.message || 'Bir hata oluştu';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
