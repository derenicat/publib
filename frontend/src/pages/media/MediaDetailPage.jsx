import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // toast eklendi
import bookService from '../../services/bookService';
import movieService from '../../services/movieService';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import AddToListModal from '../../components/media/AddToListModal';
import ReviewSection from '../../components/media/ReviewSection';
import RatingModal from '../../components/media/RatingModal';
import MediaHeader from '../../components/media/MediaHeader'; // MediaHeader import edildi

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
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0); // Trigger for ReviewSection

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
      
      // Optimistic Update for Header
      if (userReview) {
          setUserReview({ ...userReview, rating: newRating });
      } else {
          setUserReview({ rating: newRating, user: { id: user.id || user._id } });
      }

      fetchDetails(true); // Silent refresh for header details
      setReviewRefreshTrigger(prev => prev + 1); // Trigger ReviewSection refresh
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
  const backdrop = type === 'movie' && item.backdropPath ? `https://image.tmdb.org/t/p/w1280${item.backdropPath}` : null;

  return (
    <div className="relative min-h-screen pb-20">
      {/* Backdrop Image */}
      <div className="absolute inset-0 w-full h-[50vh] overflow-hidden z-0">
        {backdrop ? (
          <img src={backdrop} alt="" className="w-full h-full object-cover opacity-30 mask-image-gradient" />
        ) : (
          <div className="w-full h-full bg-linear-to-b from-brand-900/20 to-background" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 md:pt-32">
        <MediaHeader 
          item={item}
          type={type}
          userReview={userReview}
          onRate={handleRateClick}
          onAddToList={handleAddToList}
          onReviewClick={handleWriteReviewClick}
        />
      </div>

      {/* Review Section */}
      {item && (
        <div id="review-section" ref={reviewSectionRef} className="relative z-10 max-w-6xl mx-auto px-4">
            <ReviewSection 
                item={item} 
                itemModel={type === 'book' ? 'Book' : 'Movie'} 
                onReviewUpdate={() => fetchDetails(true)} // Update main page silently
                refreshTrigger={reviewRefreshTrigger}
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
            toast.success('Item added to your list!');
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
