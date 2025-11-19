import mongoose from 'mongoose';

const libraryEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  list: {
    type: mongoose.Schema.ObjectId,
    ref: 'UserList',
    required: true,
    index: true
  status: {
    type: String,
    enum: ['READ', 'READING', 'WANT_TO_READ'],
    default: 'WANT_TO_READ'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Bir kullanıcının aynı kitabı aynı listeye tekrar eklemesini önleriz.
libraryEntrySchema.index({ user: 1, book: 1, list: 1 }, { unique: true });

const LibraryEntry = mongoose.model('LibraryEntry', libraryEntrySchema);

export default LibraryEntry;
