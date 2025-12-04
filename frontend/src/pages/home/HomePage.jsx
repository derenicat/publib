import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import movieService from '../../services/movieService';
import bookService from '../../services/bookService';
import { StarIcon, FilmIcon, BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Heroicons importları

const HomePage = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('movie'); // 'movie' or 'book'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesRes, booksRes] = await Promise.all([
          movieService.getTopRated(),
          bookService.getTopRated()
        ]);
        
        if (moviesRes.data && moviesRes.data.movies) {
            setTopMovies(moviesRes.data.movies);
        }
        if (booksRes.data && booksRes.data.books) {
            setTopBooks(booksRes.data.books);
        }

      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderRatingBadge = (rating) => {
    if (!rating) return null;
    return (
        <div className="absolute top-2 right-2 bg-yellow-500/90 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1 z-10">
            <StarIcon className="h-3 w-3" /> {/* Heroicon StarIcon */}
            {rating.toFixed(1)}
        </div>
    );
  };

  const renderContent = () => {
      const items = activeTab === 'movie' ? topMovies : topBooks;
      const isMovie = activeTab === 'movie';

      if (items.length === 0) {
          return <div className="text-secondary text-center py-10">No top rated items found.</div>;
      }

      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 animate-fade-in-up">
            {items.map((item) => (
              <Link 
                to={`/media/${isMovie ? 'movie' : 'book'}/${item.detailPageId}`} 
                key={item.detailPageId}
                className="group block bg-surface rounded-xl border border-border overflow-hidden hover:border-brand-500/50 transition-all hover:shadow-xl hover:shadow-brand-900/20 hover:-translate-y-1"
              >
                <div className="aspect-2/3 bg-gray-800 relative overflow-hidden">
                  {item[isMovie ? 'posterPath' : 'coverImage'] ? (
                    <img
                      src={isMovie ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary bg-surface-accent">
                      No Image
                    </div>
                  )}
                  {renderRatingBadge(item.averageRating)}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm line-clamp-1 mb-1 group-hover:text-brand-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-secondary text-xs">
                    {isMovie 
                        ? (item.releaseDate ? item.releaseDate.split('-')[0] : 'Unknown')
                        : (item.publishedDate ? item.publishedDate.split('-')[0] : 'Unknown')
                    }
                  </p>
                </div>
              </Link>
            ))}
        </div>
      );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-fade-in-down">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
          Track your <span className="bg-linear-to-r from-brand-500 to-brand-300 text-transparent bg-clip-text">culture.</span>
        </h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto mb-8">
          Publib is the social platform for book and movie lovers. Rate, review, and see what your friends are enjoying.
        </p>
        <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg shadow-brand-900/20 transition-transform hover:scale-105">
                Get Started
            </Link>
            <Link to="/discover" className="bg-surface border border-border hover:border-white text-white px-8 py-3 rounded-full text-lg font-medium transition-colors">
                Explore
            </Link>
        </div>
      </div>

      {/* Top Rated Section with Toggle */}
      <section className="mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-6">
                <h2 className="text-3xl font-bold text-white">Top Rated</h2>
                
                {/* Custom Toggle */}
                <div className="flex bg-surface border border-border rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('movie')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                            activeTab === 'movie' 
                            ? 'bg-brand-600 text-white shadow-sm' 
                            : 'text-secondary hover:text-white'
                        }`}
                    >
                        Movies
                    </button>
                    <button 
                        onClick={() => setActiveTab('book')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                            activeTab === 'book' 
                            ? 'bg-brand-600 text-white shadow-sm' 
                            : 'text-secondary hover:text-white'
                        }`}
                    >
                        Books
                    </button>
                </div>
            </div>

            <Link 
                to={`/discover?type=${activeTab}&sort=-averageRating`} 
                className="text-brand-400 hover:text-brand-300 font-semibold text-sm flex items-center gap-1 transition-colors"
            >
                View All {activeTab === 'movie' ? 'Movies' : 'Books'}
                <ArrowRightIcon className="h-4 w-4" /> {/* Heroicon ArrowRightIcon */}
            </Link>
        </div>

        {/* Content Grid */}
        {renderContent()}

      </section>

      {/* Feature Cards (Static for now) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/discover?type=movie" className="block p-8 rounded-3xl bg-linear-to-br from-surface to-surface-accent border border-border hover:border-brand-500/50 hover:shadow-2xl transition-all group">
            <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                <FilmIcon className="h-6 w-6" /> {/* Heroicon FilmIcon */}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Discover Movies</h3>
            <p className="text-secondary">Explore the latest releases, trending films, and hidden gems tailored to your taste.</p>
        </Link>
        <Link to="/discover?type=book" className="block p-8 rounded-3xl bg-linear-to-br from-surface to-surface-accent border border-border hover:border-brand-500/50 hover:shadow-2xl transition-all group">
            <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                <BookOpenIcon className="h-6 w-6" /> {/* Heroicon BookOpenIcon */}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Explore Books</h3>
            <p className="text-secondary">Find your next great read, track your progress, and share reviews with the community.</p>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
