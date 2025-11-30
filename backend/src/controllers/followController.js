import * as followService from '../services/followService.js';
import catchAsync from '../utils/catchAsync.js';

export const followUser = catchAsync(async (req, res, next) => {
  const followerId = req.user.id; // Şu anda kimliği doğrulanmış kullanıcı
  const followingId = req.params.userId; // Takip edilecek kullanıcı

  const follow = await followService.followUser(followerId, followingId);

  res.status(201).json({
    status: 'success',
    data: {
      follow,
    },
  });
});

export const unfollowUser = catchAsync(async (req, res, next) => {
  const followerId = req.user.id; // Şu anda kimliği doğrulanmış kullanıcı
  const followingId = req.params.userId; // Takibi bırakılacak kullanıcı

  await followService.unfollowUser(followerId, followingId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getFollowing = catchAsync(async (req, res, next) => {
  const userId = req.params.userId; // Takip ettikleri listesi istenen kullanıcı

  const following = await followService.getFollowingList(userId);

  res.status(200).json({
    status: 'success',
    results: following.length,
    data: {
      following,
    },
  });
});

export const getFollowers = catchAsync(async (req, res, next) => {
  const userId = req.params.userId; // Takipçileri listesi istenen kullanıcı

  const followers = await followService.getFollowersList(userId);

  res.status(200).json({
    status: 'success',
    results: followers.length,
    data: {
      followers,
    },
  });
});

export const getMyFollowing = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // Giriş yapmış kullanıcıdan ID al

  const following = await followService.getFollowingList(userId);

  res.status(200).json({
    status: 'success',
    results: following.length,
    data: {
      following,
    },
  });
});

export const getMyFollowers = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // Giriş yapmış kullanıcıdan ID al

  const followers = await followService.getFollowersList(userId);

  res.status(200).json({
    status: 'success',
    results: followers.length,
    data: {
      followers,
    },
  });
});

export const getFollowStats = catchAsync(async (req, res, next) => {
  const userId = req.params.userId; // Takip istatistikleri istenen kullanıcı

  const stats = await followService.getFollowStats(userId);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
