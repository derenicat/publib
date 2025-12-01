import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // İlk yükleme durumu
  const [error, setError] = useState(null);

  // Uygulama başladığında kullanıcı oturumunu kontrol et
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const response = await authService.getCurrentUser();
        // Backend yanıt yapısına göre: response.data.user veya direkt response.data olabilir.
        // Genelde { status: 'success', data: { user: ... } } döneriz.
        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
           setUser(null);
        }
      } catch (err) {
        // 401 hatası normaldir, kullanıcı giriş yapmamıştır.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Giriş İşlemi
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      if (response.data && response.data.user) {
          setUser(response.data.user);
          return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Giriş başarısız oldu.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Kayıt İşlemi
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      if (response.data && response.data.user) {
          setUser(response.data.user);
          return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Kayıt başarısız oldu.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Çıkış İşlemi
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Çıkış yapılırken hata oluştu', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook: Context'i kullanmayı kolaylaştırır
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
