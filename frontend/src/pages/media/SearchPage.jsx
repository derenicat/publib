import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PhotoIcon } from '@heroicons/react/24/outline';
import bookService from '../../services/bookService';
import movieService from '../../services/movieService';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL'den parametreleri al (varsayılan değerler ile)
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'book';
  const initialPage = parseInt(searchParams.get('page')) || 1;

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialType); // 'book' or 'movie'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);

  // URL parametreleri değiştiğinde veya arama tetiklendiğinde çalış
  useEffect(() => {
    if (!initialQuery) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      setResults([]);

      try {
        let response;
        if (initialType === 'book') {
          response = await bookService.searchBooks(initialQuery, initialPage);
          if (response.data && response.data.books) {
            setResults(response.data.books);
          }
        } else {
          response = await movieService.searchMovies(initialQuery, initialPage);
          if (response.data && response.data.movies) {
            setResults(response.data.movies);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // State'leri URL ile senkronize et
    setQuery(initialQuery);
    setActiveTab(initialType);
    setPage(initialPage);

    fetchResults();
  }, [initialQuery, initialType, initialPage]); // Primitive değerlere bağla

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // URL'i güncelle, bu useEffect'i tetikleyecek
    setSearchParams({ q: query, type: activeTab, page: 1 });
  };

  const handleTabChange = (type) => {
    setActiveTab(type);
    // Eğer sorgu varsa, tab değişince hemen yeni tipte arama yap
    if (query.trim()) {
      setSearchParams({ q: query, type: type, page: 1 });
    } else {
      // Sorgu yoksa sadece URL'deki type'ı güncelle (state senkronizasyonu için)
      setSearchParams({ type: type });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setSearchParams({ q: query, type: activeTab, page: newPage });
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Search New Content</h1>

      {/* Search Controls */}
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm mb-8">
        {/* Type Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-border">
          <button
            onClick={() => handleTabChange('book')}
            className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'book'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-secondary hover:text-white'
            }`}
          >
            Books
          </button>
          <button
            onClick={() => handleTabChange('movie')}
            className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'movie'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-secondary hover:text-white'
            }`}
          >
            Movies
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search for ${activeTab}s...`}
            className="grow bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-brand-900/20 disabled:opacity-70"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results Grid */}
      {error && (
        <div className="text-center py-12 text-danger bg-surface rounded-2xl border border-border">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        results.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((item) => {
                // Data normalization (Book vs Movie)
                const id =
                  item.id || item._id || item.googleBooksId || item.tmdbId;
                const title = item.title;
                // Backend 'thumbnail' dönüyor, frontend 'coverImage' bekliyordu. Düzeltildi.
                const image =
                  activeTab === 'book'
                    ? item.thumbnail || item.coverImage
                    : `https://image.tmdb.org/t/p/w500${item.posterPath}`;
                const date =
                  activeTab === 'book' ? item.publishedDate : item.releaseDate;
                const subtitle =
                  activeTab === 'book'
                    ? item.authors
                      ? item.authors[0]
                      : 'Unknown Author'
                    : date
                      ? date.split('-')[0]
                      : '';

                return (
                  <Link
                    to={`/media/${activeTab}/${id}`} // Detay sayfasına git
                    key={id}
                    className="group block bg-surface rounded-xl border border-border overflow-hidden hover:border-brand-500/50 transition-all hover:shadow-xl hover:shadow-brand-900/20"
                  >
                    <div className="aspect-2/3 bg-gray-800 relative overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary bg-surface-accent">
                          <PhotoIcon className="h-12 w-12 text-gray-600" />
                        </div>
                      )}

                      {/* Enriched Badge (Varsa) */}
                      {item.isEnriched && (
                        <div className="absolute top-2 right-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                          In Library
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-brand-400 transition-colors">
                        {title}
                      </h3>
                      <p className="text-secondary text-xs truncate">
                        {subtitle}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-10">
              {page > 1 && ( // Sadece page 1'den büyükse göster
                <button
                  onClick={() => handlePageChange(page - 1)}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-white hover:bg-surface-accent transition-colors"
                >
                  Previous
                </button>
              )}
              <span className="text-secondary">Page {page}</span>

              {/* Next butonu sadece sayfa doluysa (20 öğe) gösterilir */}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={results.length < 20}
                className={`px-4 py-2 bg-surface border border-border rounded-lg text-white hover:bg-surface-accent transition-colors ${results.length < 20 ? 'hidden' : ''}`}
              >
                Next
              </button>
            </div>
          </>
        )
      )}

      {!loading && !error && results.length === 0 && initialQuery && (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
          <p className="text-secondary text-lg">
            No results found for "{initialQuery}".
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
