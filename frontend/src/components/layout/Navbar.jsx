import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { HomeIcon, MagnifyingGlassIcon, SparklesIcon, RssIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'; // ArrowLeftOnRectangleIcon eklendi

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false); // Logout sonrası menüyü kapat
  };

  // Dışarı tıklama olayını yakala
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        isActive(to) 
          ? 'text-brand-400 bg-brand-500/10' 
          : 'text-gray-300 hover:text-white hover:bg-surface-accent'
      }`}
    >
      <Icon className="h-5 w-5" />
      {children}
    </Link>
  );

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-md bg-surface/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-brand-500 to-brand-400 text-transparent bg-clip-text">Publib</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              <NavLink to="/" icon={HomeIcon}>Home</NavLink>
              <NavLink to="/search" icon={MagnifyingGlassIcon}>Search</NavLink>
              <NavLink to="/discover" icon={SparklesIcon}>Discover</NavLink>
              
              {user ? (
                <>
                  <NavLink to="/feed" icon={RssIcon}>Feed</NavLink>
                  
                  {/* Profile Icon and Dropdown */}
                  <div className="relative ml-4" ref={menuRef}>
                      <div>
                          <button 
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-brand-500 transition-transform hover:scale-105"
                            id="user-menu-button"
                            aria-expanded={isMenuOpen}
                            aria-haspopup="true"
                          >
                              <span className="sr-only">Open user menu</span>
                              {user.avatarUrl ? (
                                  <img className="h-9 w-9 rounded-full object-cover border-2 border-surface-accent" src={user.avatarUrl} alt="" />
                              ) : (
                                  <UserCircleIcon className="h-9 w-9 text-gray-400 hover:text-white transition-colors" />
                              )}
                          </button>
                      </div>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                          <div
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-1 bg-surface ring-1 ring-black ring-opacity-5 focus:outline-none border border-border overflow-hidden animate-fade-in-down"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="user-menu-button"
                            tabIndex="-1"
                          >
                            <div className="px-4 py-3 border-b border-border mb-1">
                                <p className="text-sm text-white font-bold truncate">{user.username}</p>
                                <p className="text-xs text-secondary truncate">{user.email}</p>
                            </div>
                            
                            <Link
                              to="/profile"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-surface-accent hover:text-white transition-colors"
                              role="menuitem"
                              tabIndex="-1"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Your Profile
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                              role="menuitem"
                              tabIndex="-1"
                            >
                              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                              Sign out
                            </button>
                          </div>
                      )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 ml-4">
                  <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-surface-accent">
                    Login
                  </Link>
                  <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-brand-900/20 transition-all hover:scale-105">
                    Register
                  </Link>
                </div>
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