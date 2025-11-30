import { UserList } from '../models/index.js';
import APIFeatures from '../utils/apiFeatures.js';

export const create = async ({ userId, name, description, isPublic, type }) => {
  return UserList.create({ user: userId, name, description, isPublic, type });
};

export const findById = async (id) => {
  return UserList.findById(id).populate({
    path: 'entries',
    populate: {
      path: 'item',
      select: 'title posterPath releaseDate backdropPath authors tmdbId googleBooksId', // Select common and useful fields
    },
  });
};

export const findOne = async ({ userId, name }) => {
  return UserList.findOne({ user: userId, name });
};

export const findAllByUser = async (userId) => {
  return UserList.find({ user: userId }).sort({ createdAt: -1 });
};

export const findAll = async (queryParams) => {
  const features = new APIFeatures(UserList.find(), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  return features.query;
};

export const findByIdAndUpdate = async (id, data) => {
  return UserList.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteById = async (id) => {
  return UserList.findByIdAndDelete(id);
};
