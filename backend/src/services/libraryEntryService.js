import * as libraryEntryRepository from '../repositories/libraryEntryRepository.js';
import * as userListRepository from '../repositories/userListRepository.js';
import AppError from '../utils/appError.js';
import { ensureBookExists } from './bookService.js';

export const addToList = async ({
  userId,
  googleBooksId,
  listName = 'My Library',
  status,
}) => {
  // 1. Kitabın yerel veritabanında varlığını garantile (Get-or-Create mantığı).
  const book = await ensureBookExists(googleBooksId);

  // 2. Hedef listeyi bul.
  const list = await userListRepository.findOne({ userId, name: listName });
  if (!list) {
    throw new AppError(
      `List with name "${listName}" not found for this user.`,
      404
    );
  }

  // 3. Girişin (entry) zaten var olup olmadığını kontrol et.
  const existingEntry = await libraryEntryRepository.findOne({
    user: userId,
    book: book.id,
    list: list.id,
  });

  if (existingEntry) {
    // Mevcut giriş zaten varsa, tekrar eklemek yerine mevcut olanı döndür.
    return existingEntry;
  }

  // 4. Yeni kütüphane girişini oluştur.
  const newEntry = await libraryEntryRepository.create({
    user: userId,
    book: book.id,
    list: list.id,
    status,
  });

  return newEntry;
};

export const getEntriesByList = async (listId) => {
  return libraryEntryRepository.findAll(
    { list: listId },
    // Kitap detaylarını da getirmek için 'book' alanını populate et.
    { path: 'book' }
  );
};

export const removeFromList = async (entryId) => {
  // Not: Bu servisi çağırmadan önce girişin sahiplik kontrolü yapılmalıdır.
  const entry = await libraryEntryRepository.deleteById(entryId);
  if (!entry) {
    throw new AppError('No library entry found with that ID.', 404);
  }
};
