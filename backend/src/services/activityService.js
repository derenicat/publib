import * as activityRepository from '../repositories/activityRepository.js';
import * as followRepository from '../repositories/followRepository.js';
import AppError from '../utils/appError.js';

// Ortak populate seçenekleri (DRY prensibi)
const getCommonPopulateOptions = () => [
  { path: 'user', select: 'username avatarUrl _id' }, // User için _id'yi açıkça seçiyoruz.
  { path: 'comments.user', select: 'username avatarUrl _id' }, // Yorum sahibinin _id'sini açıkça seçiyoruz.
  {
    path: 'subject',
    populate: [
      // Book/Movie gibi harici entegrasyonu olan öğeler için detailPageId kalmalı.
      { path: 'item', select: 'title posterPath detailPageId', strictPopulate: false },
      // Follower ve Following de User referansı olduğu için _id'yi seçiyoruz.
      { path: 'follower', select: 'username avatarUrl _id', strictPopulate: false },
      { path: 'following', select: 'username avatarUrl _id', strictPopulate: false },
      // Review için User referansını populate et
      { path: 'user', select: 'username avatarUrl _id', strictPopulate: false },
    ],
  },
];

export const getPersonalFeed = async (userId, queryParams) => {
  const populateOptions = getCommonPopulateOptions();
  return activityRepository.findAll({ user: userId, ...queryParams }, populateOptions);
};

export const getSocialFeed = async (userId, queryParams) => {
  // 1. Mevcut kullanıcının takip ettiği kullanıcıların listesini al.
  const following = await followRepository.findAll({ follower: userId });
  const followingIds = following.map((f) => f.following);

  // 2. Sadece takip edilenlerin aktivitelerini getir
  const populateOptions = getCommonPopulateOptions();

  return activityRepository.findAll({ user: { $in: followingIds }, ...queryParams }, populateOptions);
};

export const getGlobalFeed = async (queryParams) => {
  const populateOptions = getCommonPopulateOptions();
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