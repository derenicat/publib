import { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import ReviewCard from './ReviewCard';
import ReviewFormModal from './ReviewFormModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, UserCircleIcon, TrashIcon } from '@heroicons/react/24/solid'; // TrashIcon eklendi
import toast from 'react-hot-toast'; // toast eklendi

const ReviewSection = ({ item, itemModel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // error state'i toast ile gösterilecek, direkt kullanıma gerek kalmayabilir.
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editReviewData, setEditReviewData] = useState(null); // Düzenlenecek yorumun verisi

  // Backend için item ID (detailPageId öncelikli)
  const itemId = item.detailPageId || item.id || item._id || item.googleBooksId || item.tmdbId;

  const fetchReviews = async () => {
    setLoading(true);
    // setError(null); // Toast kullanacağımız için artık bu gerekli değil
    try {
      const response = await reviewService.getItemReviews(itemId, itemModel);
      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      console.error("Yorumlar çekilemedi:", err);
      toast.error("Failed to load reviews."); // Toast ile hata göster
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
    toast.success(message || 'Review saved successfully!');
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
    toast.custom((t) => (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-surface shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-border`}
        >
            <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
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
                            fetchReviews(); // Başarılıysa yorumları yeniden çek
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

  // Error state'ini artık toast ile göstereceğimiz için burada sadece boş dönebiliriz veya çok kritik bir hata varsa gösterebiliriz
  // if (error) {
  //   return <div className="text-center py-12 text-danger">{error}</div>;
  // }

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

      {/* My Review Section */}
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
