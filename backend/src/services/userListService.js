import * as userListRepository from '../repositories/userListRepository.js';
import * as libraryEntryRepository from '../repositories/libraryEntryRepository.js';
import AppError from '../utils/appError.js';

// VARSAYILAN LİSTE OLUŞTURMA:
// Yeni kayıt olan bir kullanıcı için otomatik olarak "My Library" adında
// varsayılan bir liste oluşturur. Bu, platformun temel kullanıcı deneyimi için kritiktir.
export const createDefaultList = async (userId) => {
  return userListRepository.create({
    userId,
    name: 'My Library',
    description: 'My personal collection of books and movies.',
  });
};

// ÖZEL LİSTE OLUŞTURMA:
// Kullanıcının kendi belirlediği isim ve açıklama ile yeni bir liste oluşturur.
// "My Library" gibi ayrılmış isimlerin kullanılmasını engeller.
export const createCustomList = async ({ userId, name, description }) => {
  if (name === 'My Library') {
    throw new AppError('Cannot create a custom list with a reserved name.', 400);
  }
  return userListRepository.create({ userId, name, description });
};

export const getListsByUser = async (userId) => {
  return userListRepository.findAllByUser(userId);
};

// LİSTE DETAYINI GETİRME VE ERİŞİM KONTROLÜ:
// Belirli bir listeyi ID'sine göre getirir.
// Listenin herkese açık (isPublic) olup olmadığına ve talep eden kullanıcının
// liste sahibi veya yönetici rolünde olup olmadığına göre erişim kontrolü yapar.
export const getList = async (listId, requestingUser) => {
  const list = await userListRepository.findById(listId);
  if (!list) {
    throw new AppError('No list found with that ID.', 404);
  }

  // If the list is not public, only the owner or an admin can see it.
  if (
    !list.isPublic &&
    (!requestingUser ||
      (list.user.toString() !== requestingUser.id &&
        requestingUser.role !== 'admin'))
  ) {
    throw new AppError('You do not have permission to view this list.', 403);
  }

  return list;
};

// LİSTE SİLME İŞLEMİ VE BAĞIMLILIKLAR:
// Belirli bir kullanıcı listesini siler ve bu listeye bağlı tüm kütüphane girişlerini de kaldırır.
// "My Library" gibi varsayılan listelerin silinmesini engeller.
// Not: Bu servisi çağırmadan önce liste sahiplik kontrolünün `checkOwnership` middleware'i
// tarafından yapılmış olması beklenir.
export const deleteList = async (listId) => {
  const list = await userListRepository.findById(listId);
  if (!list) {
    throw new AppError('No list found with that ID.', 404);
  }

  if (list.name === 'My Library') {
    throw new AppError('The default "My Library" list cannot be deleted.', 400);
  }

  // 1. Listenin kendisini veritabanından sil.
  await userListRepository.deleteById(listId);

  // 2. Bu listeye ait tüm kütüphane girişlerini (library entries) sil.
  await libraryEntryRepository.deleteManyByList(listId);
};
