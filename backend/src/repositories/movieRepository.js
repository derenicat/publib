import { Movie } from '../models/index.js';
import APIFeatures from '../utils/apiFeatures.js';

export const findByTmdbId = async (tmdbId) => {
  return Movie.findOne({ tmdbId });
};

export const findById = async (id) => {
  return Movie.findById(id);
};

export const findAll = async (queryParams) => {
  const features = new APIFeatures(Movie.find(), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  return features.query;
};

export const create = async (movieData) => {
  return Movie.create(movieData);
};

export const findManyByTmdbIds = (tmdbIds) => {
  return Movie.find({ tmdbId: { $in: tmdbIds } });
};

export const findManyByIds = (ids) => {
  return Movie.find({ _id: { $in: ids } });
};
