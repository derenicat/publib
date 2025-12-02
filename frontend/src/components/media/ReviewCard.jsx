import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const RatingBadge = ({ rating }) => {
  return (
    <div className="flex items-center gap-1.5 bg-surface-accent px-2 py-1 rounded-md border border-border">
        <StarIcon className="h-4 w-4 text-yellow-400" />
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
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button onClick={() => onDelete(review.id || review._id)} className="text-secondary hover:text-danger transition-colors">
                <TrashIcon className="h-5 w-5" />
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
