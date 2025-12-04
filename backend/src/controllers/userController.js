import catchAsync from '../utils/catchAsync.js';
import * as userService from '../services/userService.js';
import { convertExpiresInToMs } from '../utils/jwtHelper.js';

export const getMe = (req, res, next) => {
  // Not: Bu fonksiyon, kullanıcının kendi ID'sini `req.params.id`'ye atayarak `getUserById` kontrolcüsünü kolaylaştıran bir ara katman (middleware) gibi çalışır.
  req.params.id = req.user.id;
  next();
};

export const updateMyData = catchAsync(async (req, res, next) => {
  // Not: Şifre güncellemelerine bu kontrolcü üzerinden izin verilmez.
  const updateData = {
    username: req.body.username,
    email: req.body.email,
    bio: req.body.bio,
    avatarUrl: req.body.avatarUrl,
  };

  // Remove undefined fields
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  );

  const updatedUser = await userService.updateMyData(req.user.id, updateData);

  res.status(200).json({
    status: 'success',
    message: 'User data updated successfully.',
    data: {
      user: updatedUser,
    },
  });
});

export const updateMyPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;
  const { id: userId } = req.user;

  const { user, token } = await userService.updatePassword(
    userId,
    currentPassword,
    newPassword,
    passwordConfirm
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: convertExpiresInToMs(process.env.JWT_EXPIRES_IN),
  });

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully.',
    data: { user },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const { id: userId } = req.user;

  await userService.deleteUser(userId, password);

  // Clear the cookie after successful deletion
  res.clearCookie('token');

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await userService.getAllUsers(req.query);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // İsteği yapan kullanıcının ID'sini de gönder (Takip durumu kontrolü için)
  const requesterId = req.user?.id;
  const user = await userService.getUserById(id, requesterId);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedUser = await userService.updateUserById(id, req.body);

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully.',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await userService.deleteUserById(id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
