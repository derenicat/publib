import mongoose from 'mongoose';

export const BOOK_STATUSES = ['READ', 'READING', 'WANT_TO_READ'];
export const MOVIE_STATUSES = ['WATCHED', 'WATCHING', 'WANT_TO_WATCH'];

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
      required: true,
      validate: {
        validator: function (value) {
          if (this.itemModel === 'Book') {
            return BOOK_STATUSES.includes(value);
          }
          if (this.itemModel === 'Movie') {
            return MOVIE_STATUSES.includes(value);
          }
          return false;
        },
        message: (props) =>
          `${props.value} is not a valid status for item type ${props.instance.itemModel}.`,
      },
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Bu model için, detailPageId anlamsal olarak mantıklı değil.
        // Standart id'ye sadık kalacağız ve sadece yanıtı temizleyeceğiz.
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

// Bir kullanıcının aynı item'ı (kitap veya film) aynı listeye tekrar eklemesini önleriz.
libraryEntrySchema.index({ user: 1, list: 1, item: 1 }, { unique: true });

const LibraryEntry = mongoose.model('LibraryEntry', libraryEntrySchema);

export default LibraryEntry;
