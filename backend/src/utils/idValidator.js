import mongoose from 'mongoose';

export const isMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
