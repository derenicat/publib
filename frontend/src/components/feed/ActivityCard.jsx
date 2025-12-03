import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HeartIcon, ChatBubbleBottomCenterTextIcon, UserCircleIcon, BookOpenIcon, FilmIcon, PlusIcon } from '@heroicons/react/24/outline'; // Outline ikonlar
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'; // Dolu kalp ikonu için solid
import ReviewCard from '../media/ReviewCard'; // ReviewCard import edildi

const ActivityCard = ({ activity, onActivityUpdate }) => {
  const { user: currentUser } = useAuth();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper functions (could be moved to utils or hooks)
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';
  const getRelativeTime = (dateString) => {
    const timeAgo = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - timeAgo.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const isLiked = currentUser && activity.likes.includes(currentUser.id || currentUser._id || currentUser.detailPageId);
  // const isOwner = currentUser && (activity.user.detailPageId || activity.user.id || activity.user._id) === (currentUser.id || currentUser._id || currentUser.detailPageId);

  const handleToggleLike = async () => {
    // onActivityUpdate prop'u ile parent'a bildirip tüm feed'i yenileyebiliriz.
    // Optimistic update de yapılabilir ama şimdilik backend'in dönmesini bekleyelim.
    // await activityService.toggleLike(activity.id);
    // onActivityUpdate();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    setError(null);
    try {
      // await activityService.addComment(activity.id, commentText);
      setCommentText('');
      setShowCommentInput(false);
      // onActivityUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  // Activity Subject Render
  const renderSubject = () => {
    const subject = activity.subject; // Review, LibraryEntry, Follow
    // const subjectUser = subject.user; // If it's a review or library entry

    switch (activity.type) {
      case 'REVIEW_CREATED':
        return (
          <div className="mt-2">
            <ReviewCard 
              review={subject} 
              showMediaInfo={true} 
              hideUserHeader={true} 
              onEdit={() => {}} 
              onDelete={() => {}}
            />
          </div>
        );
      case 'LIBRARY_ENTRY_CREATED':
        return (
          <div className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5 text-green-500" />
            <span className="text-secondary text-sm">added</span>
            <Link to={`/media/${subject.itemModel.toLowerCase()}/${subject.item.detailPageId}`} className="text-brand-400 hover:underline font-semibold">
              {subject.item.title || subject.item.name}
            </Link>
            <span className="text-secondary text-sm">to their</span>
            <Link to={`/list/${subject.list.detailPageId}`} className="text-brand-400 hover:underline font-semibold">
              {subject.list.name}
            </Link>
            <span className="text-secondary text-sm">list as "{subject.status.replace(/_/g, ' ')}"</span>
          </div>
        );
      case 'FOLLOW_CREATED':
        return (
          <div className="flex items-center gap-2">
            <UserCircleIcon className="h-5 w-5 text-brand-500" />
            <span className="text-secondary text-sm">started following</span>
            <Link to={`/profile/${subject.following.detailPageId}`} className="text-brand-400 hover:underline font-semibold">
              @{subject.following.username}
            </Link>
          </div>
        );
      default:
        return <span className="text-secondary text-sm">performed an action.</span>;
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-md">
      {/* Activity Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {activity.user.avatarUrl ? (
            <img src={activity.user.avatarUrl} alt={activity.user.username} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-base font-bold">
              {getInitials(activity.user.username)}
            </div>
          )}
          <div>
            <Link to={`/profile/${activity.user.detailPageId}`} className="text-white font-semibold hover:text-brand-400 transition-colors">
              @{activity.user.username}
            </Link>
            <p className="text-secondary text-xs">{getRelativeTime(activity.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Activity Content */}
      <div className="mb-4">
        {renderSubject()}
      </div>

      {/* Media Item Thumbnail (if applicable, but ReviewCard handles it now for reviews) */}
      {/* Only show standalone media thumbnail for non-review activities if needed, but for now LibraryEntry text is enough */}
      
      {/* Likes and Comments */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border text-secondary">
        <button onClick={handleToggleLike} className="flex items-center gap-1 hover:text-white transition-colors">
          {isLiked ? <HeartIconSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
          {activity.likes.length} Likes
        </button>
        <button onClick={() => setShowCommentInput(!showCommentInput)} className="flex items-center gap-1 hover:text-white transition-colors">
          <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
          {activity.comments.length} Comments
        </button>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-grow bg-background border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={commentLoading || !commentText.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Post
          </button>
        </form>
      )}
      {error && <p className="text-danger text-sm mt-2">{error}</p>}

      {/* Comments List */}
      {activity.comments.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          {activity.comments.map((comment, index) => (
            <div key={index} className="flex items-start gap-3 mb-3">
              {comment.user.avatarUrl ? (
                <img src={comment.user.avatarUrl} alt={comment.user.username} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(comment.user.username)}
                </div>
              )}
              <div className="bg-background p-3 rounded-lg flex-grow border border-border">
                <div className="flex items-center justify-between">
                  <Link to={`/profile/${comment.user.detailPageId}`} className="text-white font-semibold text-sm hover:text-brand-400">
                    @{comment.user.username}
                  </Link>
                  <span className="text-secondary text-xs">{getRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityCard;