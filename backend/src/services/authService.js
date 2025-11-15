import userRepository from '../repositories/userRepository.js';
import { generateToken } from '../utils/jwtHelper.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';
import TokenBlacklist from '../models/tokenBlacklistModel.js';

export const register = async (username, email, password, passwordConfirm) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError('This email address is already in use.', 409);
  }

  const newUser = await userRepository.create({
    username,
    email,
    password,
    passwordConfirm,
  });

  const userObject = newUser.toObject();
  delete userObject.password;

  return userObject;
};

export const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken({ id: user.id });

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, token };
};

export const logout = async (token, exp) => {
  const expiresAt = new Date(exp * 1000); // JWT 'exp' is in seconds, convert to milliseconds

  // Add the token to the blacklist
  await TokenBlacklist.create({ token, expiresAt });
};

export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    return;
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const message = `To reset your password, please click the following link: ${resetURL}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`;

    await sendEmail({
      email: user.email,
      subject: 'Publib Password Reset Request',
      message,
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(
      'There was an error sending the email. Please try again later.',
      500
    );
  }
};

export const resetPassword = async (token, password, passwordConfirm) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await userRepository.findByPasswordResetToken(hashedToken);

  if (!user) {
    throw new AppError('Token is invalid or has expired.', 400);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const jwtToken = generateToken({ id: user.id });

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, token: jwtToken };
};
