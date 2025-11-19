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
  },
  { timestamps: true }
);

const Book = mongoose.model('Book', bookSchema);

export default Book;
