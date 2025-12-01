import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // useAuth import edildi

const RatingBadge = ({ rating }) => {
  return (
    <div className="flex items-center gap-1.5 bg-surface-accent px-2 py-1 rounded-md border border-border">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
        <span className="text-sm font-bold text-white">{rating}</span>
    </div>
  );
};

const ReviewCard = ({ review, onEdit, onDelete }) => {
  const { user } = useAuth();
  
  // Kullanıcı ID'sini güvenli bir şekilde al
  const currentUserId = user?.id || user?._id || user?.detailPageId;
  const reviewUserId = review.user.detailPageId || review.user.id || review.user._id;

  const isOwner = currentUserId && reviewUserId && currentUserId.toString() === reviewUserId.toString();

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'U';
  };

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        {/* User Info */}
        <div className="flex items-center gap-3">
          {review.user.avatarUrl ? (
            <img src={review.user.avatarUrl} alt={review.user.username} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-base font-bold">
              {getInitials(review.user.username)}
            </div>
          )}
          <div>
            <Link to={`/profile/${review.user.detailPageId || review.user.id}`} className="text-white font-semibold hover:text-brand-400 transition-colors">
              @{review.user.username}
            </Link>
            <p className="text-secondary text-xs">{formattedDate}</p>
          </div>
        </div>

        {/* Rating and Actions */}
        <div className="flex items-center gap-3">
          <RatingBadge rating={review.rating} />
          {isOwner && (
            <div className="flex gap-2">
              <button onClick={() => onEdit(review)} className="text-secondary hover:text-brand-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => onDelete(review.id || review._id)} className="text-secondary hover:text-danger transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Text */}
      <p className="text-gray-300 leading-relaxed mt-3">{review.text}</p>
    </div>
  );
};

export default ReviewCard;
