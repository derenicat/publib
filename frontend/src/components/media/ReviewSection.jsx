import { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import ReviewCard from './ReviewCard';
import ReviewFormModal from './ReviewFormModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReviewSection = ({ item, itemModel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editReviewData, setEditReviewData] = useState(null); // Düzenlenecek yorumun verisi

  // Backend için item ID (detailPageId öncelikli)
  const itemId = item.detailPageId || item.id || item._id || item.googleBooksId || item.tmdbId;

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getItemReviews(itemId, itemModel);
      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      console.error("Yorumlar çekilemedi:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId && itemModel) {
      fetchReviews();
    }
  }, [itemId, itemModel]);

  const handleReviewSuccess = () => {
    fetchReviews(); // Yorum ekledikten/düzenledikten sonra yorumları yeniden çek
    setEditReviewData(null); // Düzenleme modunu kapat
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      navigate('/login'); // Giriş yapmamışsa logine yönlendir
      return;
    }
    setEditReviewData(null); // Yeni yorum için null
    setIsFormModalOpen(true);
  };

  const handleEditReview = (review) => {
    setEditReviewData(review); // Düzenlenecek yorumu set et
    setIsFormModalOpen(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  // Kullanıcının kendi yorumunu ve diğer yorumları ayır
  const currentUserId = user?.id || user?._id || user?.detailPageId;
  const myReview = reviews.find(r => {
      const rUserId = r.user.detailPageId || r.user.id || r.user._id;
      return currentUserId && rUserId && currentUserId.toString() === rUserId.toString();
  });
  const otherReviews = reviews.filter(r => r !== myReview);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-danger">{error}</div>;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Reviews</h2>
        {!myReview && (
            <button 
            onClick={handleWriteReviewClick}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-lg shadow-brand-900/20 flex items-center gap-2"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Write a Review
            </button>
        )}
      </div>

      {/* My Review Section */}
      {myReview && (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-brand-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                Your Review
            </h3>
            <ReviewCard 
              key={myReview.id || myReview._id} 
              review={myReview} 
              onEdit={handleEditReview} 
              onDelete={handleDeleteReview} 
            />
        </div>
      )}

      {/* Community Reviews */}
      <div>
        {otherReviews.length > 0 && (
            <h3 className="text-lg font-semibold text-white mb-4">Community Reviews ({otherReviews.length})</h3>
        )}
        
        {otherReviews.length === 0 && !myReview ? (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
            <p className="text-secondary">No reviews yet. Be the first to share your thoughts!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
            {otherReviews.map((review) => (
                <ReviewCard 
                key={review.id || review._id} 
                review={review} 
                // Başkalarının yorumlarında edit/delete görünmemeli, zaten ReviewCard içinde isOwner kontrolü var ama burası ekstra güvenlik.
                onEdit={() => {}} 
                onDelete={() => {}} 
                />
            ))}
            </div>
        )}
      </div>

      <ReviewFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleReviewSuccess}
        initialData={editReviewData}
        item={item}
        itemModel={itemModel}
      />
    </div>
  );
};

export default ReviewSection;
