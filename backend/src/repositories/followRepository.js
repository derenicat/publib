import { Follow } from '../models/index.js';

export const create = async (followData) => {
  return Follow.create(followData);
};

export const findOne = async (query) => {
  return Follow.findOne(query);
};

export const deleteById = async (id) => {
  return Follow.findByIdAndDelete(id);
};

export const findAll = async (query, populateOptions = null) => {
  let queryBuilder = Follow.find(query);
  if (populateOptions) {
    queryBuilder = queryBuilder.populate(populateOptions);
  }
  return queryBuilder.sort({ createdAt: -1 });
};

export const countFollowers = async (userId) => {
  return Follow.countDocuments({ following: userId });
};

export const countFollowing = async (userId) => {
  return Follow.countDocuments({ follower: userId });
};
