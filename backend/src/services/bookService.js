import * as bookRepository from '../repositories/bookRepository.js';
import AppError from '../utils/appError.js';
import { isMongoId } from '../utils/idValidator.js';
import {
  searchBooks as searchGoogleBooks,
  getBookById as getGoogleBookById,
} from './googleBooksService.js';

// KİTAP VARLIĞINI SAĞLAMA (GET-OR-CREATE CACHING):
// Bir kitabın yerel veritabanında olup olmadığını kontrol eder.
// Gelen ID'nin formatına göre akıllıca işlem yapar.
// Eğer kitap yoksa, Google Books API'den getirir ve veritabanına kaydeder.
export const ensureBookExists = async (identifier) => {
  // If the identifier is a valid MongoID, find by that.
  if (isMongoId(identifier)) {
    const book = await bookRepository.findById(identifier);
    if (!book) {
      throw new AppError('No book found with that ID in our database.', 404);
    }
    return book;
  }

  // Otherwise, assume it's a googleBooksId and perform get-or-create.
  let book = await bookRepository.findByGoogleBooksId(identifier);

  if (book) {
    return book;
  }

  const googleBook = await getGoogleBookById(identifier);

  if (!googleBook) {
    throw new AppError('No book found with that ID on Google Books.', 404);
  }

  const newBookData = {
    googleBooksId: googleBook.googleBooksId,
    title: googleBook.title,
    subtitle: googleBook.subtitle,
    authors: googleBook.authors,
    description: googleBook.description,
    pageCount: googleBook.pageCount,
    publishedDate: googleBook.publishedDate,
    coverImage: googleBook.thumbnail,
    uniqueIdentifiers: googleBook.industryIdentifiers,
    categories: googleBook.categories,
  };

  book = await bookRepository.create(newBookData);

  return book;
};

// HİBRİT ARAMA MEKANİZMASI (HYBRID SEARCH):
// Kullanıcının arama sorgusunu öncelikle Google Books API'de yürütür.
// Google'dan gelen sonuçları, yerel veritabanımızdaki mevcut kitap bilgileriyle
// (örneğin, kitabın yerel ID'si) zenginleştirir. Eğer bir kitap yerelde varsa,
// o kitabın detay sayfasına yönlendirmek için yerel ID'sini sağlar.
export const searchBooks = async (queryParams) => {
  const { q, page, limit } = queryParams;
  if (!q) {
    throw new AppError('A search query (q) is required.', 400);
  }

  // 1. Google Books API'den ana sonuçları getir:
  const googleBooks = await searchGoogleBooks(q, page, limit);
  if (!googleBooks || googleBooks.length === 0) {
    return [];
  }

  // 2. Google Books ID'lerini topla:
  const googleBooksIds = googleBooks.map((book) => book.googleBooksId);

  // 3. Yerel veritabanından zenginleştirme verilerini getir:
  // (Google Books ID'lerini kullanarak)
  const localBooks = await bookRepository.findManyByGoogleBooksIds(
    googleBooksIds
  );
  const localBooksMap = new Map(
    localBooks.map((book) => [book.googleBooksId, book])
  );

  // 4. Google Books sonuçlarını yerel verilerle zenginleştir:
  const enrichedBooks = googleBooks.map((book) => {
    const localBook = localBooksMap.get(book.googleBooksId);

    if (localBook) {
      return {
        ...book,
        isEnriched: true,
        detailPageId: localBook._id,
      };
    }
    return {
      ...book,
      isEnriched: false,
      detailPageId: book.googleBooksId,
    };
  });

  return enrichedBooks;
};

// YEREL KİTAPLARI KEŞFETME AKIŞI (DISCOVER FLOW):
// Kitapları sadece yerel veritabanımızdan gelişmiş filtreleme seçenekleri
// (APIFeatures aracılığıyla) kullanarak getirir.
export const getAllBooks = async (queryParams) => {
  return bookRepository.findAll(queryParams);
};

// AKILLI KİTAP DETAY SERVİSİ (SMART BOOK DETAIL SERVICE):
// Tek bir kitap detayını almak için kullanılır. Gelen ID'nin MongoDB _id mi
// yoksa Google Books ID mi olduğunu akıllıca ayırt eder.
// Eğer Google Books ID ise, `ensureBookExists` fonksiyonu aracılığıyla
// kitabı yerelde var etme (get-or-create) mantığını tetikler.
export const getBookDetails = async (identifier) => {
  // The ensureBookExists function is now smart enough to handle both ID types.
  return ensureBookExists(identifier);
};

