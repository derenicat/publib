import * as activityRepository from '../repositories/activityRepository.js';
import * as followRepository from '../repositories/followRepository.js';
import AppError from '../utils/appError.js';

export const getPersonalFeed = async (userId, queryParams) => {
  const populateOptions = [
    { path: 'user', select: 'username avatarUrl detailPageId' },
    {
      path: 'subject', // Eylemin kendisini (Review, LibraryEntry, Follow) populate et
      populate: [
        // subject'in içindeki item'ı populate et (Review veya LibraryEntry için)
        { path: 'item', select: 'title posterPath detailPageId' },
        // subject'in içindeki takipçi/takip edilen user'ı populate et (Follow için)
        { path: 'follower', select: 'username avatarUrl detailPageId' },
        { path: 'following', select: 'username avatarUrl detailPageId' },
      ],
    },
  ];
  return activityRepository.findAll({ user: userId, ...queryParams }, populateOptions);
};

export const getSocialFeed = async (userId, queryParams) => {
  // 1. Mevcut kullanıcının takip ettiği kullanıcıların listesini al.
  const following = await followRepository.findAll({ follower: userId });
  const followingIds = following.map((f) => f.following.detailPageId); // detailPageId'leri al

  // 2. Kendi aktivitelerini de görmek için mevcut kullanıcının ID'sini listeye ekle.
  followingIds.push(userId);

  // 3. Bu kullanıcıların tüm aktivitelerini getir.
  const populateOptions = [
    { path: 'user', select: 'username avatarUrl detailPageId' },
    {
      path: 'subject',
      populate: [
        { path: 'item', select: 'title posterPath detailPageId' },
        { path: 'follower', select: 'username avatarUrl detailPageId' },
        { path: 'following', select: 'username avatarUrl detailPageId' },
      ],
    },
  ];

  return activityRepository.findAll({ user: { $in: followingIds }, ...queryParams }, populateOptions);
};

export const getGlobalFeed = async (queryParams) => {
  // Platform genelindeki tüm aktiviteleri getirir.
  const populateOptions = [
    { path: 'user', select: 'username avatarUrl detailPageId' },
    {
      path: 'subject',
      populate: [
        { path: 'item', select: 'title posterPath detailPageId' },
        { path: 'follower', select: 'username avatarUrl detailPageId' },
        { path: 'following', select: 'username avatarUrl detailPageId' },
      ],
    },
  ];

  return activityRepository.findAll(queryParams, populateOptions);
};

export const toggleLike = async (activityId, userId) => {
  const activity = await activityRepository.findById(activityId);
  if (!activity) {
    throw new AppError('No activity found with that ID.', 404);
  }

  // Kullanıcının daha önce beğenip beğenmediğini kontrol et
  const isLiked = activity.likes.includes(userId);

  if (isLiked) {
    return activityRepository.removeLike(activityId, userId);
  } else {
    return activityRepository.addLike(activityId, userId);
  }
};

export const addComment = async (activityId, userId, text) => {
  const activity = await activityRepository.findById(activityId);
  if (!activity) {
    throw new AppError('No activity found with that ID.', 404);
  }

  const commentData = {
    user: userId,
    text,
  };

  return activityRepository.addComment(activityId, commentData);
};

export const deleteComment = async (activityId, commentId, userId, userRole) => {
  const activity = await activityRepository.findById(activityId);
  if (!activity) {
    throw new AppError('No activity found with that ID.', 404);
  }

  const comment = activity.comments.id(commentId);
  if (!comment) {
    throw new AppError('No comment found with that ID.', 404);
  }

  // Sadece yorum sahibi veya admin silebilir
  if (comment.user.toString() !== userId && userRole !== 'admin') {
    throw new AppError('You do not have permission to delete this comment.', 403);
  }

  return activityRepository.removeComment(activityId, commentId);
};
