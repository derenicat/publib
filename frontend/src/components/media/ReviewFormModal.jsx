import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import reviewService from '../../services/reviewService';
import toast from 'react-hot-toast'; // Import toast

const ReviewFormModal = ({ isOpen, onClose, onSuccess, initialData = null, item, itemModel }) => {
  const isEditMode = !!initialData;
  const [rating, setRating] = useState(initialData?.rating || 10); // 1-10 arası
  const [reviewText, setReviewText] = useState(initialData?.text || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setReviewText(initialData.text);
    } else {
      setRating(10);
      setReviewText('');
    }
    setError(null); // Modal açıldığında hataları temizle
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('[DEBUG-FRONTEND] Full Item Object:', item);

    // Backend'den gelen objede id/id yerine detailPageId olabilir
    // Öncelik sırası: detailPageId > _id > id > external IDs
    const itemId = item.detailPageId || item._id || item.id || item.googleBooksId || item.tmdbId;
    
    console.log('[DEBUG-FRONTEND] Selected Item ID:', itemId);

    if (!itemId || itemId.length < 10) {
        console.warn('[DEBUG-FRONTEND] Warning: Selected ID seems to be an external ID, not a MongoDB ObjectId.');
    }

    const reviewPayload = {
      rating,
      text: reviewText,
      item: itemId, // Backend için item ID
      itemModel, // Backend için item Model (Book/Movie)
    };

    try {
      if (isEditMode) {
        await reviewService.updateReview(initialData.id || initialData._id, { rating, text: reviewText });
        toast.success('Review updated successfully!');
      } else {
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

        {/* Rating Selection */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-300 mb-1">
            Rating (1-10)
          </label>
          <input
            type="number"
            id="rating"
            min="1"
            max="10"
            required
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
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
