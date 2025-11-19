import * as userRepository from '../repositories/userRepository.js';
import AppError from '../utils/appError.js';
import { generateToken } from '../utils/jwtHelper.js';

export const updatePassword = async (
  userId,
  currentPassword,
  newPassword,
  passwordConfirm
) => {
  // GÜVENLİ ŞİFRE GÜNCELLEME AKIŞI:
  // 1. Kullanıcıyı veritabanından, şifre alanı dahil olmak üzere getirir.
  // 2. Mevcut şifrenin doğru girildiğini doğrular.
  // 3. Yeni şifre alanlarını kullanıcı nesnesine atar.
  // 4. `user.save()` metodunu çağırır. Bu, `userModel`'deki `pre-save` middleware'ini
  //    tetikleyerek yeni şifrenin hashlenmesini ve doğrulanmasını sağlar.
  // 5. Kullanıcıya yeni bir JWT token'ı oluşturur ve gönderir.
  const user = await userRepository.findByIdWithPassword(userId);

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Your current password is incorrect.', 401);
  }

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  const token = generateToken({ id: user.id });

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, token };
};

export const updateMyData = async (userId, dataToUpdate) => {
  // GÜVENLİ KULLANICI VERİ GÜNCELLEME:
  // 1. Eğer e-posta adresi güncelleniyorsa, yeni e-postanın başka bir kullanıcı
  //    tarafından kullanılmadığını kontrol eder.
  // 2. Veritabanında kullanıcıyı günceller.
  //    `new: true`: Mongoose'a orijinal belge yerine güncellenmiş belgeyi döndürmesini söyler.
  //    `runValidators: true`: Model şemasındaki doğrulama kurallarının (örn: e-posta formatı) uygulanmasını sağlar.
  if (dataToUpdate.email) {
    const existingUser = await userRepository.findByEmail(dataToUpdate.email);
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new AppError('This email address is already in use.', 409);
    }
  }

  const updatedUser = await userRepository.findByIdAndUpdate(
    userId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    throw new AppError('The user to be updated was not found.', 404);
  }

  return updatedUser;
};

export const deleteUser = async (userId, password) => {
  // GÜVENLİ KULLANICI HESABI SİLME (PASİFLEŞTİRME):
  // 1. Kullanıcıyı şifresiyle birlikte veritabanından getirir.
  // 2. Şifrenin doğru girildiğini doğrular.
  // 3. Kullanıcıyı veritabanından tamamen silmek yerine `active: false` olarak işaretler.
  //    Bu, veri bütünlüğünü korur ve "soft delete" (yumuşak silme) prensibini uygular.
  //    Kaydederken doğrulama adımları atlanır (`validateBeforeSave: false`).
  const user = await userRepository.findByIdWithPassword(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!(await user.comparePassword(password))) {
    throw new AppError('Your password is incorrect.', 401);
  }

  user.active = false;
  await user.save({ validateBeforeSave: false });

  return true;
};

// --- Helper functions for sanitizing user output --- //

const filterUserForPublicList = (user) => ({
  id: user._id,
  username: user.username,
  avatarUrl: user.avatarUrl,
});

const filterUserForPublicProfile = (user) => ({
  id: user._id,
  username: user.username,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  createdAt: user.createdAt,
});

// --- Publicly accessible user services --- //

export const getAllUsers = async (queryParams) => {
  const users = await userRepository.findAll(queryParams);

  // KULLANICI VERİSİ TEMİZLEME (SANITIZATION):
  // Kullanıcı nesnesini, herkese açık listelerde gösterilmeden önce
  // hassas bilgilerden arındırır. Bu, sadece gerekli ve güvenli alanların
  // (örn: username, avatarUrl) istemciye gönderilmesini sağlar.
  const filteredUsers = users.map(filterUserForPublicList);

  return filteredUsers;
};

export const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError('No user found with that ID.', 404);
  }

  // KULLANICI VERİSİ TEMİZLEME (SANITIZATION):
  // Kullanıcı nesnesini, herkese açık detaylı profil görünümünde gösterilmeden önce
  // hassas bilgilerden arındırır.
  const filteredUser = filterUserForPublicProfile(user);

  return filteredUser;
};

export const updateUserById = async (userId, dataToUpdate) => {
  // Not: Bu rota, yönetici (admin) tarafından kullanıcı verilerini güncellemek içindir.
  // Şifre güncellemeleri bu fonksiyon üzerinden yapılmamalıdır.
  if (dataToUpdate.password) {
    throw new AppError('This route is not for password updates.', 400);
  }

  const updatedUser = await userRepository.findByIdAndUpdate(
    userId,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    throw new AppError('No user found with that ID to update.', 404);
  }

  return updatedUser;
};

export const deleteUserById = async (userId) => {
  const deletedUser = await userRepository.deleteById(userId);

  if (!deletedUser) {
    throw new AppError('No user found with that ID to delete.', 404);
  }

  return true; // Indicate successful deletion
};
