import { LibraryEntry } from '../models/index.js';

export const create = async (entryData) => {
  return LibraryEntry.create(entryData);
};

export const findOne = async (query) => {
  return LibraryEntry.findOne(query);
};

export const findAll = async (query, populateOptions = {}) => {
  let queryBuilder = LibraryEntry.find(query);

  if (populateOptions.path) {
    queryBuilder = queryBuilder.populate(populateOptions);
  }

  return queryBuilder.sort({ addedAt: -1 });
};

export const deleteById = async (id) => {
  return LibraryEntry.findByIdAndDelete(id);
};

export const deleteManyByList = async (listId) => {
  return LibraryEntry.deleteMany({ list: listId });
};
