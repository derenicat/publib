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
  type: {
    type: String,
    required: [true, 'List type is required.'],
    enum: ['Book', 'Movie'],
  },

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: { virtuals: true },
});

// Bir kullanıcının aynı isimde ve aynı türde iki listesi olamaz
userListSchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

// Sanal (Virtual) populate ile UserList'e ait olan libraryEntry'leri çekiyoruz.
userListSchema.virtual('entries', {
  ref: 'LibraryEntry',
  foreignField: 'list',
  localField: '_id',
});

const UserList = mongoose.model('UserList', userListSchema);

export default UserList;
