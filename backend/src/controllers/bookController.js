import {
  getAllBooks as serviceGetAllBooks,
  searchBooks as serviceSearchBooks,
  getBookDetails,
} from '../services/bookService.js';
import catchAsync from '../utils/catchAsync.js';

export const aliasTopBooks = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-averageRating,-ratingsCount';
  req.query.fields = 'title,coverImage,averageRating,publishedDate,detailPageId,authors';
  next();
};

export const aliasMostPopularBooks = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsCount,-averageRating';
  req.query.fields = 'title,coverImage,averageRating,ratingsCount,publishedDate,detailPageId,authors';
  next();
};

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
  const book = await getBookDetails(req.params.identifier);

  res.status(200).json({
    status: 'success',
    data: {
      book,
    },
  });
});
