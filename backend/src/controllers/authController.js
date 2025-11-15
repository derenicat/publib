import { convertExpiresInToMs } from '../utils/jwtHelper.js';
import {
  register as authRegister,
  login as authLogin,
  logout as authLogout,
  forgotPassword as authForgotPassword,
  resetPassword as authResetPassword,
} from '../services/authService.js';
import catchAsync from '../utils/catchAsync.js';

export const register = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  const newUser = await authRegister(
    username,
    email,
    password,
    passwordConfirm
  );

  res.status(201).json({
    status: 'success',
    message: 'User successfully registered.',
    data: { user: newUser },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const { user, token } = await authLogin(email, password);

  // Set JWT token as an HttpOnly cookie (as per ARCHITECTURE.md)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS
    maxAge: convertExpiresInToMs(process.env.JWT_EXPIRES_IN),
  });

  res.status(200).json({
    status: 'success',
    message: 'Login successful.',
    data: { user },
  });
});

export const logout = catchAsync(async (req, res, next) => {
  // Get the token from the cookie
  const token = req.cookies.token;

  // Get the expiration time from the decoded token (set by the protect middleware)
  // If protect middleware is not used before logout, this might be undefined.
  // For now, we assume protect middleware is used for logout route.
  const exp = req.user ? req.user.exp : null;

  if (token && exp) {
    await authLogout(token, exp);
  }

  res.clearCookie('token');
  res.status(200).json({ status: 'success', message: 'Logout successful.' });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  // The service layer handles the logic
  await authForgotPassword(req.body.email);

  res.status(200).json({
    status: 'success',
    message: 'Password reset link sent to your email address.',
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  const { token: resetToken } = req.params;

  const { user, token } = await authResetPassword(
    resetToken,
    password,
    passwordConfirm
  );

  // Log the user in by setting the cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: convertExpiresInToMs(process.env.JWT_EXPIRES_IN),
  });

  res.status(200).json({
    status: 'success',
    message: 'Password successfully updated and logged in.',
    data: { user },
  });
});