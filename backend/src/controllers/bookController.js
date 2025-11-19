import {
  getAllBooks as serviceGetAllBooks,
  searchBooks as serviceSearchBooks,
  getBookDetails,
} from '../services/bookService.js';
import catchAsync from '../utils/catchAsync.js';

export const getAllBooks = catchAsync(async (req, res, next) => {
  // "Discover" akışı: Sadece yerel veritabanımızdaki mevcut kitapları listeler.
  const books = await serviceGetAllBooks(req.query);

  res.status(200).json({
    status: 'success',
    results: books.length,
    data: {
      books,
    },
  });
});

export const searchBooks = catchAsync(async (req, res, next) => {
  // "Hybrid Search" akışı: Google'da arama yapar ve sonuçları yerel verilerle zenginleştirir.
  const books = await serviceSearchBooks(req.query);

  res.status(200).json({
    status: 'success',
    results: books.length,
    data: {
      books,
    },
  });
});

export const getBook = catchAsync(async (req, res, next) => {
  const book = await getBookDetails(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      book,
    },
  });
});