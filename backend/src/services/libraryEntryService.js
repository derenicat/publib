import * as libraryEntryRepository from '../repositories/libraryEntryRepository.js';
import * as userListRepository from '../repositories/userListRepository.js';
import * as activityRepository from '../repositories/activityRepository.js'; // NEW IMPORT
import AppError from '../utils/appError.js';
import { ensureBookExists } from './bookService.js';
import { ensureMovieExists } from './movieService.js';

export const addToList = async ({
  userId,
  item: itemId, // Anlaşılırlık için yeniden adlandırma
  itemModel,
  list: listId, // Anlaşılırlık için yeniden adlandırma
  status,
}) => {
  // 1. Öğenin (kitap veya film) yerel veritabanımızda var olduğundan emin ol (Get-or-Create).
  let item;
  if (itemModel === 'Book') {
    item = await ensureBookExists(itemId);
  } else if (itemModel === 'Movie') {
    item = await ensureMovieExists(itemId);
  } else {
    // Bu durum doğrulayıcı tarafından yakalanmalı, ancak bir önlem olarak:
    throw new AppError('Invalid itemModel specified.', 400);
  }

  if (!item) {
    throw new AppError('The specified item could not be found or created.', 404);
  }

  // 2. Hedef listeyi bul.
  const list = await userListRepository.findById(listId);
  
  // list.user populated olduğu için ID'sini almalıyız.
  const listOwnerId = list ? (list.user.id || list.user._id.toString()) : null;

  if (!list || listOwnerId !== userId) {
    throw new AppError(
      'List not found or you do not have permission to add to it.',
      404
    );
  }

  // TÜR GÜVENLİĞİ KONTROLÜ:
  // Listenin türü ile eklenmeye çalışılan öğenin türü eşleşmelidir.
  // Örneğin, bir 'Book' listesine 'Movie' eklenemez.
  if (list.type !== itemModel) {
    throw new AppError(
      `This list is for ${list.type}s only. You cannot add a ${itemModel} to it.`,
      400
    );
  }

  // 3. Girişin zaten var olup olmadığını kontrol et.
  const existingEntry = await libraryEntryRepository.findOne({
    user: userId,
    item: item.id,
    list: list.id,
  });

  if (existingEntry) {
    // Zaten varsa ve statü farklıysa güncelle
    if (existingEntry.status !== status) {
      existingEntry.status = status;
      await existingEntry.save();
    }
    return existingEntry; 
  }

  // 4. Yeni kütüphane girişini oluştur.
  const newEntry = await libraryEntryRepository.create({
    user: userId,
    item: item.id,
    itemModel, // Model adını ilet
    list: list.id,
    status,
  });

  // 5. Yeni kütüphane girişi için bir aktivite akışı girişi oluştur
  console.log('[DEBUG] Creating Activity for Library Entry:', newEntry._id);
  await activityRepository.create({
    user: userId,
    type: 'LIBRARY_ENTRY_CREATED',
    subject: newEntry._id, // .id yerine ._id
    subjectModel: 'LibraryEntry',
  });

  return newEntry;
};

export const getEntriesByList = async (listId) => {
  return libraryEntryRepository.findAll(
    { list: listId },
    // Polimorfik 'item' alanını doldur. Mongoose, hangi koleksiyona bakacağını bilmek için itemModel'i kullanacaktır.
    { path: 'item' }
  );
};

export const removeFromList = async (entryId) => {
  // Not: Bu servisi çağırmadan önce girişin sahiplik kontrolü yapılmalıdır.
  const entry = await libraryEntryRepository.deleteById(entryId);
  if (!entry) {
    throw new AppError('No library entry found with that ID.', 404);
  }
};
