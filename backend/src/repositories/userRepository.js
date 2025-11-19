import { User } from '../models/index.js';
import APIFeatures from '../utils/apiFeatures.js';

export const findByEmail = async (email) => {
  // Since we need the password for the 'login' process,
  // we explicitly include the 'password' field, which is normally not selected.
  return User.findOne({ email }).select('+password');
};

export const findById = async (id) => {
  return User.findById(id);
};

export const findByIdWithPassword = async (id) => {
  return User.findById(id).select('+password');
};

export const findByPasswordResetToken = async (hashedToken) => {
  return User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
};

export const findAll = async (queryParams) => {
  // Not: `APIFeatures` sınıfını kullanarak Mongoose sorgusunu filtreler, sıralar ve sayfalandırırız.
  // `User.find()` başlangıç sorgusudur. `pre('find')` middleware'i `active: { $ne: false }` filtresini zaten ekleyecektir.
  const features = new APIFeatures(User.find(), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Zincirlenmiş ve değiştirilmiş nihai sorguyu çalıştırırız.
  const users = await features.query;
  return users;
};

export const create = async (userData) => {
  // Not: Şifre hashleme işlemi `userModel` içindeki `pre-save` hook tarafından otomatik olarak yapılır.
  const newUser = await User.create(userData);
  return newUser;
};

export const findByIdAndUpdate = async (id, data, options) => {
  return User.findByIdAndUpdate(id, data, options);
};

export const deleteById = async (id) => {
  return User.findByIdAndDelete(id);
};