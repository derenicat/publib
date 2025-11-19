import mongoose from 'mongoose';

const libraryEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    item: {
      type: mongoose.Schema.ObjectId,
      required: true,
      refPath: 'itemModel',
    },
    itemModel: {
      type: String,
      required: true,
      enum: ['Book', 'Movie'],
    },
    list: {
      type: mongoose.Schema.ObjectId,
      ref: 'UserList',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'READ',
        'READING',
        'WANT_TO_READ',
        'WANT_TO_WATCH',
        'WATCHING',
        'WATCHED',
      ],
      default: 'WANT_TO_READ', // Not: Bu varsayılan değer, eklenen öğe film olduğunda anlamsız olabilir. İleride gözden geçirilebilir.
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Bir kullanıcının aynı item'ı (kitap veya film) aynı listeye tekrar eklemesini önleriz.
libraryEntrySchema.index({ user: 1, list: 1, item: 1 }, { unique: true });

const LibraryEntry = mongoose.model('LibraryEntry', libraryEntrySchema);

export default LibraryEntry;
