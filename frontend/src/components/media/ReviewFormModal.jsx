import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import reviewService from '../../services/reviewService';
import toast from 'react-hot-toast';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';

const ReviewFormModal = ({ isOpen, onClose, onSuccess, initialData = null, item, itemModel, existingRating, existingReview }) => {
  const isEditMode = !!initialData;
  const [rating, setRating] = useState(initialData?.rating || existingRating || 10); 
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(initialData?.text || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setRating(initialData.rating);
            setReviewText(initialData.text);
        } else if (existingRating) {
            setRating(existingRating);
            setReviewText('');
        } else {
            setRating(10);
            setReviewText('');
        }
        setError(null);
        setHoverRating(0);
    }
  }, [initialData, existingRating, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Backend'den gelen objede id/id yerine detailPageId olabilir
    // Öncelik sırası: detailPageId > _id > id > external IDs
    const itemId = item.detailPageId || item._id || item.id || item.googleBooksId || item.tmdbId;
    
    const reviewPayload = {
      rating,
      text: reviewText,
      item: itemId, // Backend için item ID
      itemModel, // Backend için item Model (Book/Movie)
    };

    try {
      if (isEditMode) {
        // Klasik Edit Modu (Var olan metinli yorumu düzenleme)
        await reviewService.updateReview(initialData.id || initialData._id, { rating, text: reviewText });
        toast.success('Review updated successfully!');
      } else if (existingReview) {
        // Upsert Modu (Sadece puanı olan kaydı güncelleme)
        await reviewService.updateReview(existingReview.id || existingReview._id, { rating, text: reviewText });
        toast.success('Review submitted successfully!');
      } else {
        // Yeni Yorum Oluşturma
        await reviewService.createReview(reviewPayload);
        toast.success('Review submitted successfully!');
      }
      
      onSuccess(isEditMode ? 'Review updated successfully!' : 'Review submitted successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Your Review" : `Write a Review for ${item?.title}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger/10 border border-danger text-danger text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Rating Selection (Stars) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rating
          </label>
          <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(10)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= (hoverRating || rating);
                
                return (
                    <button
                        type="button"
                        key={starValue}
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        {isFilled ? (
                            <StarIconSolid className="h-8 w-8 text-yellow-500" />
                        ) : (
                            <StarIconOutline className="h-8 w-8 text-gray-500 hover:text-yellow-400" />
                        )}
                    </button>
                );
            })}
            <span className="ml-3 text-lg font-bold text-white">{hoverRating || rating}/10</span>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-300 mb-1">
            Your Review
          </label>
          <textarea
            id="reviewText"
            rows="5"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this content..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-full font-bold text-white transition-all ${
            loading 
            ? 'bg-brand-700 cursor-not-allowed opacity-70' 
            : 'bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40'
          }`}
        >
          {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Submit Review')}
        </button>
      </form>
    </Modal>
  );
};

export default ReviewFormModal;
