import { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import ReviewCard from './ReviewCard';
import ReviewFormModal from './ReviewFormModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, UserCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const ReviewSection = ({ item, itemModel, onReviewUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editReviewData, setEditReviewData] = useState(null);

  const itemId = item.detailPageId || item.id || item._id || item.googleBooksId || item.tmdbId;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getItemReviews(itemId, itemModel);
      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      console.error("Yorumlar çekilemedi:", err);
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId && itemModel) {
      fetchReviews();
    }
  }, [itemId, itemModel]);

  const handleReviewSuccess = (message) => {
    // toast.success(message || 'Review saved successfully!'); // Çifte toast'ı önlemek için kaldırıldı (Modal zaten gösteriyor)
    fetchReviews(); 
    setEditReviewData(null);
    if (onReviewUpdate) onReviewUpdate(); // Ana sayfayı güncelle
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEditReviewData(null);
    setIsFormModalOpen(true);
  };

  const handleEditReview = (review) => {
    setEditReviewData(review);
    setIsFormModalOpen(true);
  };

  const handleDeleteReview = async (reviewId) => {
    toast.custom((t) => (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-surface shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-border`}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="shrink-0 pt-0.5">
                        <TrashIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white">
                            Delete Review
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                            Are you sure you want to delete this review?
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex border-l border-border">
                <button
                    onClick={() => {
                        toast.dismiss(t.id);
                        toast.promise(reviewService.deleteReview(reviewId), {
                            loading: 'Deleting review...',
                            success: <b>Review deleted!</b>,
                            error: (err) => <b>{err.response?.data?.message || 'Failed to delete review.'}</b>,
                        }).then(() => {
                            fetchReviews();
                            if (onReviewUpdate) onReviewUpdate(); // Ana sayfayı güncelle
                        });
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-400 hover:text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    Delete
                </button>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
            </div>
        </div>
    ), { duration: Infinity });
  };

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

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Reviews</h2>
        {!myReview && (
            <button 
            onClick={handleWriteReviewClick}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-lg shadow-brand-900/20 flex items-center gap-2"
            >
            <PencilSquareIcon className="h-5 w-5" />
            Write a Review
            </button>
        )}
      </div>

      {myReview && (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-brand-400 mb-4 flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5" />
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