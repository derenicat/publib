import mongoose from 'mongoose';

const userListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'List name is required.'],
    trim: true
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },

}, { timestamps: true });

// Bir kullanıcının aynı isimde iki listesi olamaz
userListSchema.index({ user: 1, name: 1 }, { unique: true });

const UserList = mongoose.model('UserList', userListSchema);

export default UserList;
