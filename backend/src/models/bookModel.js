import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    googleBooksId: {
      type: String,
      required: [true, 'Google Books ID is required.'],
      unique: true,
    },
    uniqueIdentifiers: [
      {
        type: { type: String },
        identifier: { type: String },
        _id: false,
      },
    ],
    title: {
      type: String,
      required: [true, 'A book must have a title.'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    authors: [
      {
        type: String,
      },
    ],
    publisher: String,
    publishedDate: String,
    description: String,
    pageCount: Number,
    categories: [String],
    coverImage: String,
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [10, 'Rating cannot be more than 10'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.detailPageId = doc._id.toString(); // doc._id üzerinden al
        delete ret.id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

const Book = mongoose.model('Book', bookSchema);

export default Book;
