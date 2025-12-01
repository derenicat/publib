import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import reviewService from '../../services/reviewService';
import libraryEntryService from '../../services/libraryEntryService';
import userListService from '../../services/userListService';

const BOOK_STATUSES = [
  { value: 'READING', label: 'Reading' },
  { value: 'READ', label: 'Read' } // Default
];

const MOVIE_STATUSES = [
  { value: 'WATCHING', label: 'Watching' },
  { value: 'WATCHED', label: 'Watched' } // Default
];

const RatingModal = ({ isOpen, onClose, item, type, onSuccess, initialData }) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [status, setStatus] = useState(type === 'book' ? 'READ' : 'WATCHED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
        setRating(initialData.rating);
    } else {
        setRating(0);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    setError(null);

    const itemId = item.detailPageId || item._id || item.id || item.googleBooksId || item.tmdbId;
    const itemModel = type === 'book' ? 'Book' : 'Movie';

    try {
      if (initialData) {
        // Update existing review
        await reviewService.updateReview(initialData.id || initialData._id, {
            rating,
            // text alanını güncellemiyoruz, sadece puanı güncelliyoruz
        });
      } else {
        // Create new review
        await reviewService.createReview({
            rating,
            text: '', // Boş metin
            item: itemId,
            itemModel
        });
      }

      // 2. Statüyü güncelle (Update durumunda da statü güncellemek isteyebiliriz)
      // ... (Mevcut kod)
      // Backend createReview içinde zaten varsayılan listeye ekliyor ama statü sabit (READ/WATCHED).
      // Biz yine de kullanıcının seçtiği statüyü ve listeyi garantiye alalım.
      
      // Varsayılan listeyi bul ("My Books" veya "My Movies")
      const myLists = await userListService.getMyLists();
      const defaultListName = type === 'book' ? 'My Books' : 'My Movies';
      const targetList = myLists.data.lists.find(l => l.name === defaultListName);

      if (targetList) {
        await libraryEntryService.addEntry({
            list: targetList.detailPageId || targetList.id || targetList._id,
            item: itemId,
            itemModel,
            status
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      // 409 Conflict (Already reviewed) hatası gelirse, güncelleme yapmayı teklif edebiliriz ama şimdilik hata gösterelim
      setError(err.response?.data?.message || 'Failed to save rating.');
    } finally {
      setLoading(false);
    }
  };

  const statuses = type === 'book' ? BOOK_STATUSES : MOVIE_STATUSES;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rate ${item?.title}`}>
      <div className="space-y-6">
        {error && (
          <div className="bg-danger/10 border border-danger text-danger text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Star Rating */}
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        className="focus:outline-none transition-transform hover:scale-110"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-8 w-8 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
            </div>
            <span className="text-2xl font-bold text-white">{rating > 0 ? rating : '-'}</span>
        </div>

        {/* Status Selection */}
        <div>
          <label htmlFor="rating-status" className="block text-sm font-medium text-gray-300 mb-1">
            Add to List as...
          </label>
          <select
            id="rating-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors appearance-none"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className={`w-full py-3 rounded-full font-bold text-white transition-all ${
            loading || rating === 0
            ? 'bg-brand-700 cursor-not-allowed opacity-70' 
            : 'bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40'
          }`}
        >
          {loading ? 'Saving...' : 'Save Rating'}
        </button>
      </div>
    </Modal>
  );
};

export default RatingModal;
