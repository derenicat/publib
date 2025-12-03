import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon, PlusIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import bookService from '../../services/bookService';
import movieService from '../../services/movieService';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import AddToListModal from '../../components/media/AddToListModal';
import ReviewSection from '../../components/media/ReviewSection';
import RatingModal from '../../components/media/RatingModal';

const MediaDetailPage = () => {
  const { type, id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const reviewSectionRef = useRef(null);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [userReview, setUserReview] = useState(null);

  // Fetch Item Details and User Review
  const fetchDetails = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      let data;
      if (type === 'book') {
        const response = await bookService.getBookDetails(id);
        data = response.data.book;
      } else if (type === 'movie') {
        const response = await movieService.getMovieDetails(id);
        data = response.data.movie;
      } else {
        throw new Error('Invalid media type.');
      }
      setItem(data);

      // Eğer kullanıcı giriş yapmışsa, bu item için yorumu var mı kontrol et
      if (user) {
        const itemId = data.detailPageId || data._id || data.id;
        const itemModel = type === 'book' ? 'Book' : 'Movie';
        const reviewsResponse = await reviewService.getItemReviews(itemId, itemModel);
        
        if (reviewsResponse.data && reviewsResponse.data.reviews) {
            const currentUserId = user.id || user._id || user.detailPageId;
            const foundReview = reviewsResponse.data.reviews.find(r => {
                const rUserId = r.user.detailPageId || r.user.id || r.user._id;
                return currentUserId && rUserId && currentUserId.toString() === rUserId.toString();
            });
            setUserReview(foundReview || null);
        }
      }

    } catch (err) {
      console.error("Detaylar yüklenirken hata:", err);
      setError(err.response?.data?.message || 'Failed to load content details.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (type && id) {
      fetchDetails();
    }
  }, [type, id, user]);

  const handleAddToList = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleRateClick = () => {
    if (!user) {
        navigate('/login');
        return;
    }
    setIsRatingModalOpen(true);
  };

  const handleRatingSuccess = (newRating) => {
      setIsRatingModalOpen(false);
      
      // Optimistic Update
      if (userReview) {
          setUserReview({ ...userReview, rating: newRating });
      } else {
          // Yeni review ise (geçici ID ve user ile)
          setUserReview({ rating: newRating, user: { id: user.id || user._id } });
      }

      fetchDetails(true); // Silent refresh
  };

  const handleWriteReviewClick = () => {
    if (reviewSectionRef.current) {
        reviewSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-danger mb-4">Error</h2>
        <p className="text-secondary mb-6">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="text-brand-500 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!item) return null;

  // Veri normalizasyonu
  const title = item.title;
  const description = item.description || item.overview;
  const image = type === 'book' ? item.coverImage : `https://image.tmdb.org/t/p/w780${item.posterPath}`;
  const backdrop = type === 'movie' && item.backdropPath ? `https://image.tmdb.org/t/p/w1280${item.backdropPath}` : null;
  const releaseDate = type === 'book' ? item.publishedDate : item.releaseDate;
  
  const creators = type === 'book' ? item.authors : []; 
  const tags = type === 'book' ? item.categories : item.genres;

  return (
    <div className="relative min-h-screen pb-20">
      {/* Backdrop Image */}
      <div className="absolute inset-0 w-full h-[50vh] overflow-hidden z-0">
        {backdrop ? (
          <img src={backdrop} alt="" className="w-full h-full object-cover opacity-30 mask-image-gradient" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-brand-900/20 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 md:pt-32">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0 w-64 md:w-80 rounded-xl overflow-hidden shadow-2xl border-4 border-surface-accent">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-96 bg-surface-accent flex items-center justify-center text-secondary">
                No Image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {title}
                </h1>
                
                {/* Rating Badge & Rate Button */}
                <div className="flex items-center gap-3">
                    {item.averageRating > 0 && (
                        <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-md px-4 py-2 rounded-lg border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
                            <StarIcon className="h-6 w-6 text-yellow-400" />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-xl font-bold text-white">{item.averageRating.toFixed(1)}</span>
                                <span className="text-[10px] text-secondary">{item.ratingsCount} ratings</span>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        onClick={handleRateClick}
                        className={`backdrop-blur-md p-2 rounded-lg border transition-colors flex items-center gap-2 ${
                            userReview 
                            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30' 
                            : 'bg-surface/80 border-border text-gray-400 hover:text-yellow-400 hover:bg-surface-accent'
                        }`}
                        title={userReview ? "Update your rating" : "Rate this"}
                    >
                        <StarIcon className="h-8 w-8" fill={userReview ? "currentColor" : "none"} />
                        {userReview && (
                            <span className="font-bold text-lg pr-1">{userReview.rating}</span>
                        )}
                    </button>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-secondary mb-6 text-sm md:text-base">
              {releaseDate && (
                <span className="bg-surface px-3 py-1 rounded-full border border-border">
                  {new Date(releaseDate).getFullYear()}
                </span>
              )}
              {tags && tags.map(tag => (
                <span key={tag} className="text-gray-300">
                  {tag}
                </span>
              ))}
              {type === 'book' && item.pageCount && (
                <span className="text-gray-400">
                  {item.pageCount} pages
                </span>
              )}
            </div>

            {creators && creators.length > 0 && (
              <p className="text-lg text-gray-300 mb-6">
                by <span className="text-white font-semibold">{creators.join(', ')}</span>
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
              <button 
                onClick={handleAddToList}
                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg shadow-brand-900/20 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add to List
              </button>
              <button 
                onClick={handleWriteReviewClick}
                className="bg-surface hover:bg-surface-accent text-white border border-border px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
              >
                <PencilSquareIcon className="h-5 w-5" />
                Write Review
              </button>
            </div>

            {/* Description */}
            <div className="bg-surface/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-3">Overview</h3>
              <p className="text-gray-300 leading-relaxed">
                {description ? description.replace(/<[^>]*>?/gm, '') : "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      {item && (
        <div id="review-section" ref={reviewSectionRef} className="relative z-10 max-w-6xl mx-auto px-4">
            <ReviewSection 
                item={item} 
                itemModel={type === 'book' ? 'Book' : 'Movie'} 
                onReviewUpdate={() => fetchDetails(true)} // Update main page silently
            />
        </div>
      )}

      {/* Add To List Modal */}
      <AddToListModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        item={item}
        type={type}
        onSuccess={() => {
            alert('Item added to your list!');
        }}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        item={item}
        type={type}
        initialData={userReview} // Update modu için mevcut yorumu gönder
        onSuccess={handleRatingSuccess}
      />
    </div>
  );
};

export default MediaDetailPage;
