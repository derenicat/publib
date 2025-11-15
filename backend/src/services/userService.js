import userRepository from '../repositories/userRepository.js';
import AppError from '../utils/appError.js';
import { generateToken } from '../utils/jwtHelper.js';

export const updatePassword = async (
  userId,
  currentPassword,
  newPassword,
  passwordConfirm
) => {
  // 1. Get user from collection with their password
  const user = await userRepository.findByIdWithPassword(userId);

  // 2. Check if posted current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Your current password is incorrect.', 401);
  }

  // 3. If so, update password
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;

  // 4. The user.save() will trigger the 'pre-save' middleware in the model
  // which will hash the new password and check for confirmation.
  await user.save();

  // 5. Log user in, send JWT
  const token = generateToken({ id: user.id });

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, token };
};

export const updateMyData = async (userId, dataToUpdate) => {
  // 1. Check if the new email is already taken by another user
  if (dataToUpdate.email) {
    const existingUser = await userRepository.findByEmail(dataToUpdate.email);
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new AppError('This email address is already in use.', 409);
    }
  }

  // 2. Find user by ID and update their data
  // We use findByIdAndUpdate for efficiency.
  // { new: true } returns the modified document rather than the original.
  // { runValidators: true } ensures that our model's validation rules (e.g., for email format) are applied.
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
  // 1. Get user from collection with their password
  const user = await userRepository.findByIdWithPassword(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // 2. Check if posted password is correct
  if (!(await user.comparePassword(password))) {
    throw new AppError('Your password is incorrect.', 401);
  }

  // 3. If password is correct, set user to inactive
  user.active = false;
  await user.save({ validateBeforeSave: false }); // We don't need to run validations like passwordConfirm here

  return true; // Indicate successful deletion
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

  // Sanitize every user object for the public list view
  const filteredUsers = users.map(filterUserForPublicList);

  return filteredUsers;
};

export const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError('No user found with that ID.', 404);
  }

  // Sanitize the user object for the detailed public profile view
  const filteredUser = filterUserForPublicProfile(user);

  return filteredUser;
};

export const updateUserById = async (userId, dataToUpdate) => {
  // Admin can update any user's data, including their role.
  // Password updates should not be done through this function.
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