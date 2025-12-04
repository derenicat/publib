import * as followRepository from '../repositories/followRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import AppError from '../utils/appError.js';

export const followUser = async (followerId, followingId) => {
  // 1. Kullanıcının kendini takip etmeye çalışıp çalışmadığını kontrol et
  if (followerId.toString() === followingId.toString()) {
    throw new AppError('You cannot follow yourself.', 400);
  }

  // 2. Takip edilecek kullanıcının var olup olmadığını kontrol et
  const followingUser = await userRepository.findById(followingId);
  if (!followingUser) {
    throw new AppError('User to follow not found.', 404);
  }

  // 3. Zaten takip edip etmediğini kontrol et
  const existingFollow = await followRepository.findOne({
    follower: followerId,
    following: followingId,
  });

  if (existingFollow) {
    throw new AppError('You are already following this user.', 409); // Conflict
  }

  // 4. Takip ilişkisini oluştur
  const newFollow = await followRepository.create({
    follower: followerId,
    following: followingId,
  });

  return newFollow;
};

export const unfollowUser = async (followerId, followingId) => {
  // 1. Takip edilen kullanıcının var olup olmadığını kontrol et
  const followingUser = await userRepository.findById(followingId);
  if (!followingUser) {
    throw new AppError('User to unfollow not found.', 404);
  }

  // 2. Takip ilişkisini bul
  const follow = await followRepository.findOne({
    follower: followerId,
    following: followingId,
  });

  if (!follow) {
    throw new AppError('You are not following this user.', 404); // Not found
  }

  // 3. Takip ilişkisini sil
  await followRepository.deleteById(follow.id); // Bulunan takip belgesindeki id'yi kullan
};

export const getFollowingList = async (userId) => {
  return followRepository.findAll(
    { follower: userId },
    { path: 'following', select: 'username avatarUrl' }
  );
};

export const getFollowersList = async (userId) => {
  return followRepository.findAll(
    { following: userId },
    { path: 'follower', select: 'username avatarUrl' }
  );
};

export const getFollowStats = async (userId) => {
  const followersCount = await followRepository.countFollowers(userId);
  const followingCount = await followRepository.countFollowing(userId);
  return { followersCount, followingCount };
};
