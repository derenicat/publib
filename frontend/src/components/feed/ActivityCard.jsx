import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  UserCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ReviewCard from '../media/ReviewCard';
import { getInitials, getRelativeTime } from '../../utils/helpers';
import activityService from '../../services/activityService';
import toast from 'react-hot-toast';

const ActivityCard = ({ activity }) => {
  const { user: currentUser } = useAuth();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Local state for optimistic updates
  const [isLiked, setIsLiked] = useState(
    currentUser && activity.likes.includes(currentUser.id)
  );
  const [likesCount, setLikesCount] = useState(activity.likes.length);
  const [comments, setComments] = useState(activity.comments);

  const handleToggleLike = async () => {
    if (!currentUser) return;

    // Optimistic Update
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      await activityService.toggleLike(activity.id);
    } catch (err) {
      // Rollback on error
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      toast.error('Failed to update like.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    setCommentLoading(true);
    try {
      const response = await activityService.addComment(
        activity.id,
        commentText
      );
      
      // Backend might not return populated user, so we construct the UI object manually
      // response.data.activity contains the full updated activity, but comments.user might be ID.
      // Safe bet: Construct new comment from current user details for immediate display.
      // We need the ID of the new comment from the response though, to allow deletion.
      // Let's assume the last comment in the returned activity is the new one.
      const updatedActivity = response.data.activity;
      const newCommentFromServer = updatedActivity.comments[updatedActivity.comments.length - 1];

      const newComment = {
        _id: newCommentFromServer._id,
        text: commentText,
        createdAt: new Date().toISOString(),
        user: {
            id: currentUser.id,
            username: currentUser.username,
            avatarUrl: currentUser.avatarUrl
        }
      };

      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await activityService.deleteComment(activity.id, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted.');
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  // Activity Subject Render
  const renderSubject = () => {
    const subject = activity.subject;

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
        if (!subject.list || !subject.item) return null;
        return (
          <div className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5 text-green-500 shrink-0" />
            <span className="text-secondary text-sm">added</span>
            <Link
              to={`/media/${subject.itemModel.toLowerCase()}/${subject.item.detailPageId}`}
              className="text-brand-400 hover:underline font-semibold"
            >
              {subject.item.title || subject.item.name}
            </Link>
            <span className="text-secondary text-sm">to their</span>
            <Link
              to={`/list/${subject.list.id}`}
              className="text-brand-400 hover:underline font-semibold"
            >
              {subject.list.name}
            </Link>
            <span className="text-secondary text-sm">
              list as "{subject.status.replace(/_/g, ' ')}"
            </span>
          </div>
        );
      default:
        return (
          <span className="text-secondary text-sm">performed an action.</span>
        );
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-md">
      {/* Activity Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {activity.user.avatarUrl ? (
            <img
              src={activity.user.avatarUrl}
              alt={activity.user.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-base font-bold">
              {getInitials(activity.user.username)}
            </div>
          )}
          <div>
            <Link
              to={`/profile/${activity.user.id}`}
              className="text-white font-semibold hover:text-brand-400 transition-colors"
            >
              @{activity.user.username}
            </Link>
            <p className="text-secondary text-xs">
              {getRelativeTime(activity.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Content */}
      <div className="mb-4">{renderSubject()}</div>

      {/* Likes and Comments */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border text-secondary">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-white'}`}
        >
          {isLiked ? (
            <HeartIconSolid className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          {likesCount} Likes
        </button>
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
          {comments.length} Comments
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
            className="grow bg-background border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={commentLoading || !commentText.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {commentLoading ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      {/* Comments List */}
      {comments.length > 0 && showCommentInput && (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => {
            // Check ownership: Use id as per standard
            const isOwner = currentUser && (comment.user.id === currentUser.id);
            
            return (
            <div key={comment.id} className="flex items-start gap-3 group">
              {comment.user.avatarUrl ? (
                <img
                  src={comment.user.avatarUrl}
                  alt={comment.user.username}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(comment.user.username)}
                </div>
              )}
              <div className="bg-background p-3 rounded-lg grow border border-border relative">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/profile/${comment.user.id}`}
                    className="text-white font-semibold text-sm hover:text-brand-400"
                  >
                    @{comment.user.username}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary text-xs">
                        {getRelativeTime(comment.createdAt)}
                    </span>
                    {isOwner && (
                        <button 
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete comment"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-300 text-sm mt-1 break-words">{comment.text}</p>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
