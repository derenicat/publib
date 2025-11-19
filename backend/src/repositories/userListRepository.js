import { UserList } from '../models/index.js';

export const create = async ({ userId, name, description }) => {
  return UserList.create({ user: userId, name, description });
};

export const findById = async (id) => {
  return UserList.findById(id);
};

export const findOne = async ({ userId, name }) => {
  return UserList.findOne({ user: userId, name });
};

export const findAllByUser = async (userId) => {
  return UserList.find({ user: userId }).sort({ createdAt: -1 });
};

export const findByIdAndUpdate = async (id, data) => {
  return UserList.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteById = async (id) => {
  return UserList.findByIdAndDelete(id);
};
