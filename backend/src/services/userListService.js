import * as userListRepository from '../repositories/userListRepository.js';
import * as libraryEntryRepository from '../repositories/libraryEntryRepository.js';
import AppError from '../utils/appError.js';

// VARSAYILAN LİSTE OLUŞTURMA:
// Yeni kayıt olan bir kullanıcı için otomatik olarak "My Books" ve "My Movies" adında
// iki varsayılan liste oluşturur. Bu, platformun temel kullanıcı deneyimi için kritiktir.
export const createDefaultList = async (userId) => {
  await userListRepository.create({
    userId,
    name: 'My Books',
    description: 'My personal collection of books.',
    type: 'Book',
  });

  await userListRepository.create({
    userId,
    name: 'My Movies',
    description: 'My personal collection of movies.',
    type: 'Movie',
  });
};

// ÖZEL LİSTE OLUŞTURMA:
// Kullanıcının kendi belirlediği isim, açıklama ve tür ile yeni bir liste oluşturur.
// "My Books" ve "My Movies" gibi ayrılmış isimlerin kullanılmasını engeller.
export const createCustomList = async ({
  userId,
  name,
  description,
  isPublic,
  type,
}) => {
  if (name === 'My Books' || name === 'My Movies') {
    throw new AppError('Cannot create a custom list with a reserved name.', 400);
  }
  return userListRepository.create({
    userId,
    name,
    description,
    isPublic,
    type,
  });
};

export const getListsByUser = async (userId) => {
  return userListRepository.findAllByUser(userId);
};

// TÜM HERKESE AÇIK LİSTELERİ GETİRME (KEŞFET AKIŞI):
// Platformdaki tüm herkese açık listeleri, filtreleme ve sayfalama seçenekleriyle getirir.
export const getAllPublicLists = async (queryParams) => {
  // Sorguya 'isPublic: true' koşulunu zorunlu olarak ekliyoruz.
  const filter = { ...queryParams, isPublic: true };
  return userListRepository.findAll(filter);
};

// BAŞKA KULLANICININ LİSTELERİNİ GETİRME (GENEL):
// Bir kullanıcının profilinde gösterilmek üzere, sadece herkese açık (isPublic: true)
// listelerini getirir.
export const getPublicListsByUser = async (userId) => {
  return userListRepository.findAll({ user: userId, isPublic: true });
};

// LİSTE DETAYINI GETİRME VE ERİŞİM KONTROLÜ:
// Belirli bir listeyi ID'sine göre, girdileriyle (entries) birlikte getirir.
// Repository katmanı, virtual populate sayesinde girdileri otomatik olarak çeker.
// Listenin herkese açık (isPublic) olup olmadığına ve talep eden kullanıcının
// liste sahibi veya yönetici rolünde olup olmadığına göre erişim kontrolü yapar.
export const getList = async (listId, requestingUser) => {
  const list = await userListRepository.findById(listId);

  if (!list) {
    throw new AppError('No list found with that ID.', 404);
  }

  // list.user populated olduğu için obje olarak gelir. ID'sini alırız.
  const ownerId = list.user.id || list.user._id.toString();

  // If the list is not public, only the owner or an admin can see it.
  if (
    !list.isPublic &&
    (!requestingUser ||
      (ownerId !== requestingUser.id &&
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

  if (list.name === 'My Books' || list.name === 'My Movies') {
    throw new AppError('The default lists cannot be deleted.', 400);
  }

  // 1. Listenin kendisini veritabanından sil.
  await userListRepository.deleteById(listId);

  // 2. Bu listeye ait tüm kütüphane girişlerini (library entries) sil.
  await libraryEntryRepository.deleteManyByList(listId);
};
