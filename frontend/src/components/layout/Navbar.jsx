import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-white tracking-tight">
              Publib
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/search" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Search
              </Link>
              <Link to="/discover" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Discover
              </Link>
              
              {user ? (
                <>
                  <Link to="/feed" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Feed
                  </Link>
                  <Link to="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Profile ({user.username})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium ml-4"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="bg-accent hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium ml-2 transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu button (Basit hali) */}
          <div className="-mr-2 flex md:hidden">
            {/* Buraya mobile menu butonu gelecek, şimdilik boş */}
             <span className="text-gray-500 text-xs">Mobile Menu WIP</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
