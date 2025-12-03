import * as reviewRepository from '../repositories/reviewRepository.js';
import * as userListRepository from '../repositories/userListRepository.js';
import * as libraryEntryService from './libraryEntryService.js';
import * as activityRepository from '../repositories/activityRepository.js';
import { ensureBookExists } from './bookService.js';
import { ensureMovieExists } from './movieService.js';
import AppError from '../utils/appError.js';

export const createReview = async ({
  userId,
  item: itemId,
  itemModel,
  rating,
  text,
}) => {
  // 1. Öğenin (kitap veya film) yerel veritabanımızda var olduğundan emin ol.
  const item =
    itemModel === 'Book'
      ? await ensureBookExists(itemId)
      : await ensureMovieExists(itemId);

  if (!item) {
    throw new AppError('The item you are trying to review does not exist.', 404);
  }

  console.log('[DEBUG] Review Service - Item Found:', item); // DEBUG
  console.log('[DEBUG] Review Service - Item ID (.id):', item.id); // DEBUG
  console.log('[DEBUG] Review Service - Item _ID (._id):', item._id); // DEBUG

  // 2. Yorumu oluştur.
  let newReview;
  try {
    newReview = await reviewRepository.create({
      user: userId,
      item: item._id, // Kesinlikle MongoDB ObjectId (_id) kullan
      itemModel,
      rating,
      text,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('You have already reviewed this item.', 409);
    }
    throw error;
  }

  // 3. (YENİ ÖZELLİK) Öğeyi otomatik olarak doğru varsayılan listeye ekle.
  const defaultListName = itemModel === 'Book' ? 'My Books' : 'My Movies';
  const defaultList = await userListRepository.findOne({
    userId,
    name: defaultListName,
  });
  if (defaultList) {
    await libraryEntryService.addToList({
      userId,
      item: item.id,
      itemModel,
      list: defaultList.id,
      status: itemModel === 'Book' ? 'READ' : 'WATCHED',
    });
  }

  // 4. Yeni yorum için bir aktivite akışı girişi oluştur
  console.log('[DEBUG] Creating Activity for Review:', newReview._id);
  await activityRepository.create({
    user: userId,
    type: 'REVIEW_CREATED',
    subject: newReview._id, // .id yerine ._id
    subjectModel: 'Review',
  });

  return newReview;
};

export const getAllReviews = async (queryParams) => {
  // Bu servis artık yorumları sorgu parametrelerine göre filtreleyebilir.
  // Bağlam için her zaman kullanıcı ve öğe bilgilerini dolduracağız.
  const populateOptions = [
    { path: 'user', select: 'username avatarUrl detailPageId' },
    { path: 'item', select: 'title posterPath detailPageId' },
  ];

  // queryParams'i doğrudan findAll'a gönderiyoruz. APIFeatures filtreleme, sıralama ve sayfalama işlemlerini halledecek.
  return reviewRepository.findAll(queryParams, populateOptions);
};

export const getReviewById = async (reviewId) => {
  const populateOptions = [
    { path: 'user', select: 'username avatarUrl detailPageId' },
    { path: 'item', select: 'title posterPath detailPageId' },
  ];
  const review = await reviewRepository.findById(reviewId, populateOptions);

  if (!review) {
    throw new AppError('No review found with that ID.', 404);
  }
  return review;
};

export const updateReview = async (reviewId, userId, updateData) => {
  // 1. Yorumu bul.
  const review = await reviewRepository.findById(reviewId);
  if (!review) {
    throw new AppError('No review found with that ID.', 404);
  }

  // 2. Sahiplik kontrolü yap.
  if (review.user.toString() !== userId) {
    throw new AppError('You can only update your own reviews.', 403);
  }

  // 3. Yorumu güncelle.
  const updatedReview = await reviewRepository.findByIdAndUpdate(
    reviewId,
    updateData
  );

  // 4. Güncellemeden sonra istatistikleri yeniden hesapla.
  if (updatedReview) {
    await updatedReview.constructor.calculateStats(
      updatedReview.item,
      updatedReview.itemModel
    );
  }

  return updatedReview;
};

export const deleteReview = async (reviewId, userId) => {
  // 1. Silmeden önce 'item' bilgisini alabilmek için yorumu bul.
  const review = await reviewRepository.findById(reviewId);
  if (!review) {
    throw new AppError('No review found with that ID.', 404);
  }

  // 2. Sahiplik kontrolü yap.
  if (review.user.toString() !== userId) {
    throw new AppError('You can only delete your own reviews.', 403);
  }

  // 3. Yorumu sil.
  await reviewRepository.deleteById(reviewId);

  // 4. Yorum silindikten sonra istatistikleri yeniden hesapla.
  await review.constructor.calculateStats(review.item, review.itemModel);
};
