import * as activityService from '../services/activityService.js';
import catchAsync from '../utils/catchAsync.js';

export const getPersonalFeed = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user.id; // Belirli bir kullanıcı veya giriş yapmış kullanıcı için akışı getir

  const feed = await activityService.getPersonalFeed(userId, req.query);

  res.status(200).json({
    status: 'success',
    results: feed.length,
    data: {
      feed,
    },
  });
});

export const getSocialFeed = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // Her zaman giriş yapmış kullanıcı için

  const feed = await activityService.getSocialFeed(userId, req.query);

  res.status(200).json({
    status: 'success',
    results: feed.length,
    data: {
      feed,
    },
  });
});

export const getGlobalFeed = catchAsync(async (req, res, next) => {
  const feed = await activityService.getGlobalFeed(req.query);

  res.status(200).json({
    status: 'success',
    results: feed.length,
    data: {
      feed,
    },
  });
});

export const likeActivity = catchAsync(async (req, res, next) => {
  const { id: activityId } = req.params;
  const userId = req.user.id;

  const updatedActivity = await activityService.toggleLike(activityId, userId);

  res.status(200).json({
    status: 'success',
    data: {
      activity: updatedActivity,
    },
  });
});

export const commentOnActivity = catchAsync(async (req, res, next) => {
  const { id: activityId } = req.params;
  const userId = req.user.id;
  const { text } = req.body;

  const updatedActivity = await activityService.addComment(
    activityId,
    userId,
    text
  );

  res.status(201).json({
    status: 'success',
    data: {
      activity: updatedActivity,
    },
  });
});

export const deleteCommentOnActivity = catchAsync(async (req, res, next) => {
  const { id: activityId, commentId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const updatedActivity = await activityService.deleteComment(
    activityId,
    commentId,
    userId,
    userRole
  );

  res.status(200).json({
    status: 'success',
    data: {
      activity: updatedActivity,
    },
  });
});
