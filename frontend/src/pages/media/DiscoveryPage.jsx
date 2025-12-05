import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import bookService from '../../services/bookService';
import movieService from '../../services/movieService';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest Added' },
  { value: 'createdAt', label: 'Oldest Added' },
  { value: '-averageRating', label: 'Top Rated' },
  { value: '-ratingsCount', label: 'Most Popular' },
  { value: '-releaseDate', label: 'Release Date (Newest)' }, // Books için publishedDate
];

// TMDB Common Genres (Static for now)
const MOVIE_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'TV Movie',
  'Thriller',
  'War',
  'Western',
];

// BISAC Subject Headings for Books
const BOOK_GENRES = [
  "Fiction", "Science Fiction", "Fantasy", "Mystery", "Thriller", "Romance", "Historical Fiction", "Horror", "Young Adult",
  "Juvenile Fiction", "Juvenile Nonfiction",
  "Biography & Autobiography", "History", "Science", "Technology", "Computers", "Business & Economics", "Self-Help", "Psychology", "Philosophy", "Religion",
  "Cooking", "Travel", "Art", "Photography", "Music", "Performing Arts", "Poetry", "Comics & Graphic Novels", "Education", "Social Science",
  "Political Science", "Law", "True Crime", "Health & Fitness", "Medical", "Sports & Recreation", "Games & Activities", "Crafts & Hobbies",
  "House & Home", "Gardening", "Pets", "Nature", "Antiques & Collectibles", "Transportation", "Architecture", "Design", "Literary Criticism",
  "Language Arts & Disciplines", "Reference", "Study Aids"
];

// Son 100 yılı kapsayan on yıllar (2020, 2010, 2000, ...)
const CURRENT_YEAR = new Date().getFullYear();
const START_DECADE = Math.floor(CURRENT_YEAR / 10) * 10;
const DECADES = Array.from({ length: 10 }, (_, i) => START_DECADE - i * 10);

const DiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialType = searchParams.get('type') || 'movie'; // Default movie
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const initialSort = searchParams.get('sort') || '-createdAt';
  const initialGenre = searchParams.get('genre') || '';
  const initialYear = searchParams.get('year') || '';
  const initialDecade = searchParams.get('decade') ? parseInt(searchParams.get('decade')) : '';

  const [activeTab, setActiveTab] = useState(initialType);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState(initialSort);
  const [genre, setGenre] = useState(initialGenre);
  const [year, setYear] = useState(initialYear);
  const [activeDecade, setActiveDecade] = useState(initialDecade);

  // Eğer URL'de yıl varsa, decade state'ini otomatik ayarla (Barın görünmesi için)
  useEffect(() => {
    if (year) {
      setActiveDecade(Math.floor(year / 10) * 10);
    } else if (!activeDecade && initialDecade) {
        setActiveDecade(initialDecade);
    }
  }, [year, initialDecade]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        const params = {
          page,
          sort,
          limit: 20,
        };

        // Genre filtresi
        if (genre) {
            if (activeTab === 'movie') {
                params.genres = genre;
            } else if (activeTab === 'book') {
                params.categories = genre;
            }
        }
        
        // Tarih Filtreleme Mantığı (Letterboxd Style)
        let startDate, endDate;

        if (year) {
            // 1. Spesifik Yıl Seçiliyse (Örn: 2014)
            startDate = `${year}-01-01`;
            endDate = `${year}-12-31`;
        } else if (activeDecade) {
            // 2. Sadece On Yıl Seçiliyse (Örn: 2010s -> 2010-2019)
            startDate = `${activeDecade}-01-01`;
            endDate = `${activeDecade + 9}-12-31`;
        }

        if (startDate && endDate) {
            if (activeTab === 'book') {
                params['publishedDate[gte]'] = startDate;
                params['publishedDate[lte]'] = endDate;
            } else if (activeTab === 'movie') {
                params['releaseDate[gte]'] = startDate;
                params['releaseDate[lte]'] = endDate;
            }
        }

        if (activeTab === 'book') {
          response = await bookService.getBooks(params);
          if (response.data && response.data.books) {
            setItems(response.data.books);
          }
        } else {
          response = await movieService.getMovies(params);
          if (response.data && response.data.movies) {
            setItems(response.data.movies);
          } else {
            setItems([]);
          }
        }
      } catch (err) {
        console.error('Discovery failed:', err);
        setError('Failed to load content.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    // URL'i güncelle
    const currentParams = {};
    if (activeTab) currentParams.type = activeTab;
    if (page > 1) currentParams.page = page;
    if (sort !== '-createdAt') currentParams.sort = sort;
    if (genre) currentParams.genre = genre;
    if (year) currentParams.year = year;
    if (activeDecade && !year) currentParams.decade = activeDecade; // Yıl seçili değilse decade'i tut
    
    setSearchParams(currentParams);

    fetchItems();
  }, [activeTab, page, sort, genre, year, activeDecade, setSearchParams]);

  const handleTabChange = (type) => {
    setActiveTab(type);
    setPage(1);
    setGenre('');
    setYear('');
    setActiveDecade('');
  };

  const handleDecadeChange = (e) => {
    const val = e.target.value ? parseInt(e.target.value) : '';
    setActiveDecade(val);
    setYear(''); // Dönem değişince spesifik yılı sıfırla
    setPage(1);
  };

  const handleYearSelect = (selectedYear) => {
    setYear(selectedYear === year ? '' : selectedYear); // Tekrar tıklanırsa seçimi kaldır
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Discover</h1>

      {/* Controls Container */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm mb-8 overflow-hidden">
        <div className="p-6">
            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-border">
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
            </div>

            {/* Main Filters */}
            <div className="flex flex-wrap gap-4">
            {/* Sort */}
            <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
            >
                {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
                ))}
            </select>

            {/* Genre */}
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Genres</option>
              {(activeTab === 'movie' ? MOVIE_GENRES : BOOK_GENRES).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Decade Filter */}
            <select
                value={activeDecade}
                onChange={handleDecadeChange}
                className="bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
            >
                <option value="">All Decades</option>
                {DECADES.map((d) => (
                <option key={d} value={d}>
                    {d}s
                </option>
                ))}
            </select>
            </div>
        </div>

        {/* Horizontal Year Bar (Letterboxd Style) */}
        {activeDecade && (
            <div className="bg-surface-accent/50 border-t border-border px-6 py-3 overflow-x-auto">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setYear('')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                            !year 
                            ? 'bg-brand-600 text-white' 
                            : 'bg-surface border border-border text-secondary hover:text-white hover:border-brand-500'
                        }`}
                    >
                        All {activeDecade}s
                    </button>
                    <div className="w-px h-4 bg-border mx-2 shrink-0"></div>
                    {Array.from({ length: 10 }, (_, i) => activeDecade + i).map((y) => (
                         <button
                            key={y}
                            onClick={() => handleYearSelect(y.toString())}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                                year === y.toString()
                                ? 'bg-brand-600 text-white'
                                : 'bg-surface border border-border text-secondary hover:text-white hover:border-brand-500'
                            }`}
                         >
                            {y}
                         </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-danger">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
          <p className="text-secondary text-lg">
            No items found in the library.
          </p>
          <p className="text-secondary text-sm mt-2">
            Try changing filters or go to Search to add new content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((item) => {
            const id = item.detailPageId || item.id || item._id; 
            const title = item.title;
            const image =
              activeTab === 'book'
                ? item.coverImage
                : `https://image.tmdb.org/t/p/w500${item.posterPath}`;
            const date =
              activeTab === 'book' ? item.publishedDate : item.releaseDate;
            const rating = item.averageRating
              ? item.averageRating.toFixed(1)
              : '-';

            return (
              <Link
                to={`/media/${activeTab}/${id}`}
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
                      No Image
                    </div>
                  )}

                  {/* Rating Badge */}
                  {item.averageRating > 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                      {rating}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-brand-400 transition-colors">
                    {title}
                  </h3>
                  <p className="text-secondary text-xs truncate">
                    {date ? date.split('-')[0] : 'Unknown Year'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10">
        {page > 1 && ( // Sadece page 1'den büyükse göster
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-white hover:bg-surface-accent transition-colors"
          >
            Previous
          </button>
        )}
        <span className="text-secondary">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={items.length < 20} // Lazy pagination check
          className={`px-4 py-2 bg-surface border border-border rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-accent transition-colors ${items.length < 20 ? 'hidden' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DiscoveryPage;