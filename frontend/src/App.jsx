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
import FeedPage from './pages/feed/FeedPage'; // Yeni eklendi
import { Toaster } from 'react-hot-toast';

// Placeholder Components
const HomePage = () => (
  <div className="text-center mt-20">
    <h1 className="text-4xl font-bold text-white mb-4">Welcome to Publib</h1>
    <p className="text-xl text-secondary">Your social library platform.</p>
  </div>
);

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/discover" element={<DiscoveryPage />} />
            <Route path="/feed" element={<FeedPage />} /> {/* Yeni FeedPage rotası */}
            <Route path="/media/:type/:id" element={<MediaDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Korumalı Rota */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

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
