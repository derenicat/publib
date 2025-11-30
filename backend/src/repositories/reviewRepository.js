import { Review } from '../models/index.js';
import APIFeatures from '../utils/apiFeatures.js';

export const create = async (reviewData) => {
  return Review.create(reviewData);
};

export const findById = async (id, populateOptions = null) => {
  let query = Review.findById(id);
  if (populateOptions) {
    query = query.populate(populateOptions);
  }
  return query;
};

export const findAll = async (queryParams, populateOptions = null) => {
  const features = new APIFeatures(Review.find(), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (populateOptions) {
    features.query = features.query.populate(populateOptions);
  }

  return features.query;
};

export const findByIdAndUpdate = async (id, updateData) => {
  return Review.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteById = async (id) => {
  return Review.findByIdAndDelete(id);
};
