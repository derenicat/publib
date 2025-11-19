import { Book } from '../models/index.js';
import APIFeatures from '../utils/apiFeatures.js';

export const findByGoogleBooksId = async (googleBooksId) => {
  return Book.findOne({ googleBooksId });
};

export const findById = async (id) => {
  return Book.findById(id);
};

export const findAll = async (queryParams) => {
  const features = new APIFeatures(Book.find(), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  return features.query;
};

export const create = async (bookData) => {
  return Book.create(bookData);
};

export const findManyByGoogleBooksIds = (googleBooksIds) => {
  return Book.find({ googleBooksId: { $in: googleBooksIds } });
};

export const findManyByIds = (ids) => {
  return Book.find({ _id: { $in: ids } });
};

