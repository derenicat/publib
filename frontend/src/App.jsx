import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import ListDetailPage from './pages/media/ListDetailPage';
import SearchPage from './pages/media/SearchPage';
import MediaDetailPage from './pages/media/MediaDetailPage';
import DiscoveryPage from './pages/media/DiscoveryPage';
import FeedPage from './pages/feed/FeedPage';
import HomePage from './pages/home/HomePage'; // Updated import
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'; // Yeni eklendi
import ResetPasswordPage from './pages/auth/ResetPasswordPage'; // Yeni eklendi
import UserSearchPage from './pages/users/UserSearchPage'; 
import { Toaster } from 'react-hot-toast';

const NotFoundPage = () => (
  <div className="text-center py-20">
    <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
    <p className="text-xl text-white">Page not found.</p>
  </div>
);

// Basit Protected Route Bileşeni
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="text-white text-center mt-10">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Misafir Kullanıcılar İçin Rota Bileşeni
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="text-white text-center mt-10">Loading...</div>;

  if (user) {
    return <Navigate to="/" replace />; // Giriş yapmış kullanıcıyı anasayfaya yönlendir
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/discover" element={<DiscoveryPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/users/search" element={<UserSearchPage />} />{' '}
            {/* Yeni UserSearchPage rotası */}
            <Route path="/media/:type/:id" element={<MediaDetailPage />} />
            
            {/* Misafir Kullanıcı Rotası: Login ve Register sadece misafirler için */}
            <Route 
              path="/login" 
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              } 
            />
            
            <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* Yeni rota */}
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* Yeni rota */}
                        
            {/* Korumalı Rota: Kendi Profilim */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Genel Profil Görüntüleme (ID ile) */}
            <Route path="/profile/:id" element={<ProfilePage />} />
            
            {/* Liste Detay Sayfası */}
            <Route
              path="/list/:id"
              element={
                <ProtectedRoute>
                  <ListDetailPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
        <Toaster /> {/* Toaster bileşeni buraya eklendi */}
      </Router>
    </AuthProvider>
  );
}

export default App;
