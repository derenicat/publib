import { Activity } from '../models/index.js';
import APIFeatures from '../utils/apiFeatures.js';

export const create = async (activityData) => {
  return Activity.create(activityData);
};

export const findAll = async (queryParams, populateOptions = null) => {
  const features = new APIFeatures(Activity.find(), queryParams)
    .filter()
    .sort() // Varsayılan olarak -createdAt'a göre sıralayacak
    .limitFields()
    .paginate();

  if (populateOptions) {
    features.query = features.query.populate(populateOptions);
  }

  return features.query;
};

export const findById = async (id) => {
  return Activity.findById(id);
};

export const addLike = async (activityId, userId) => {
  return Activity.findByIdAndUpdate(
    activityId,
    { $addToSet: { likes: userId } },
    { new: true }
  );
};

export const removeLike = async (activityId, userId) => {
  return Activity.findByIdAndUpdate(
    activityId,
    { $pull: { likes: userId } },
    { new: true }
  );
};

export const addComment = async (activityId, commentData) => {
  return Activity.findByIdAndUpdate(
    activityId,
    { $push: { comments: commentData } },
    { new: true }
  );
};

export const removeComment = async (activityId, commentId) => {
  return Activity.findByIdAndUpdate(
    activityId,
    { $pull: { comments: { _id: commentId } } },
    { new: true }
  );
};
