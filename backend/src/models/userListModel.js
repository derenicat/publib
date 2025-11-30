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

}, { timestamps: true });

// Bir kullanıcının aynı isimde iki listesi olamaz
userListSchema.index({ user: 1, name: 1 }, { unique: true });

// Sanal (Virtual) populate ile UserList'e ait olan libraryEntry'leri çekiyoruz.
userListSchema.virtual('entries', {
  ref: 'LibraryEntry',
  foreignField: 'list',
  localField: '_id',
});

// JSON'a çevrilirken sanal alanların da dahil edilmesini sağlar.
userListSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.detailPageId = ret.id; // Rename `id` to `detailPageId` for consistency
    delete ret.id;
    delete ret._id;
    delete ret.__v;
  },
});
userListSchema.set('toObject', { virtuals: true });

const UserList = mongoose.model('UserList', userListSchema);

export default UserList;
