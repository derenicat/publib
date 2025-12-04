import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getInitials, formatDate } from '../../utils/helpers';

const RatingBadge = ({ rating }) => {
  return (
    <div className="flex items-center gap-1.5 bg-surface-accent px-2 py-1 rounded-md border border-border">
        <StarIcon className="h-4 w-4 text-yellow-400" />
        <span className="text-sm font-bold text-white">{rating}</span>
    </div>
  );
};

const ReviewCard = ({ review, onEdit, onDelete, showMediaInfo = false, hideUserHeader = false }) => {
  const { user } = useAuth();
  
  // Kullanıcı ID'sini güvenli bir şekilde al
  const currentUserId = user?.id || user?._id;
  const reviewUserId = review.user.id || review.user._id;

  const isOwner = currentUserId && reviewUserId && currentUserId.toString() === reviewUserId.toString();

  const formattedDate = formatDate(review.createdAt);

  // Media item bilgileri (eğer varsa)
  const item = review.item;
  const itemModel = review.itemModel ? review.itemModel.toLowerCase() : 'book'; // Default book
  const itemImage = item ? (item.coverImage || (item.posterPath ? `https://image.tmdb.org/t/p/w92${item.posterPath}` : null)) : null;

  return (
    <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
      {!hideUserHeader ? (
        <div className="flex items-center justify-between mb-3">
          {/* User Info */}
          <div className="flex items-center gap-3">
            {review.user.avatarUrl ? (
              <img src={review.user.avatarUrl} alt={review.user.username} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-base font-bold">
                {getInitials(review.user.username)}
              </div>
            )}
            <div>
              <Link to={`/profile/${review.user.id}`} className="text-white font-semibold hover:text-brand-400 transition-colors">
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
      ) : (
        <div className="flex justify-between items-center mb-2">
           <RatingBadge rating={review.rating} />
           {/* Actions can be hidden or shown here depending on needs. For feed, usually actions are on the activity itself, but review actions might be useful. */}
        </div>
      )}

      {/* Review Text (Only if exists) */}
      {review.text && <p className="text-gray-300 leading-relaxed mt-3">{review.text}</p>}

      {/* Media Info (Context) */}
      {showMediaInfo && item && (
        <div className="flex items-center gap-4 mt-4 bg-surface p-2 rounded-lg border border-transparent transition-colors hover:bg-surface-accent">
          <Link to={`/media/${itemModel}/${item.detailPageId}`} className="shrink-0">
            {itemImage ? (
              <img
                src={itemImage}
                alt={item.title}
                className="w-12 h-20 object-cover rounded-md shadow-sm"
              />
            ) : (
              <div className="w-12 h-20 bg-gray-700 rounded-md flex items-center justify-center text-xs text-secondary">
                No Img
              </div>
            )}
          </Link>
          <div>
            <Link to={`/media/${itemModel}/${item.detailPageId}`} className="text-white font-bold hover:text-brand-400 transition-colors line-clamp-1">
              {item.title}
            </Link>
            <p className="text-secondary text-xs mt-0.5">
              {itemModel === 'book' ? 'Book' : 'Movie'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
