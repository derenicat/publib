import { convertExpiresInToMs } from '../utils/jwtHelper.js';
import authService from '../services/authService.js';
import catchAsync from '../utils/catchAsync.js';

const authController = {
  /**
   * Registers a new user.
   * POST /api/auth/register
   */
  register: catchAsync(async (req, res, next) => {
    const { username, email, password, passwordConfirm } = req.body;

    const newUser = await authService.register(
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
  }),

  /**
   * Logs in a user.
   * POST /api/auth/login
   */
  login: catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const { user, token } = await authService.login(email, password);

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
  }),

  /**
   * Logs out a user and clears the cookie.
   * POST /api/auth/logout
   */
  logout: catchAsync(async (req, res, next) => {
    res.clearCookie('token');
    res.status(200).json({ status: 'success', message: 'Logout successful.' });
  }),

  /**
   * Creates a password reset request.
   * POST /api/auth/forgot-password
   */
  forgotPassword: catchAsync(async (req, res, next) => {
    // The service layer handles the logic
    await authService.forgotPassword(req.body.email);

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email address.',
    });
  }),

  /**
   * Resets a user's password.
   * PATCH /api/auth/reset-password/:token
   */
  resetPassword: catchAsync(async (req, res, next) => {
    const { password, passwordConfirm } = req.body;
    const { token: resetToken } = req.params;

    const { user, token } = await authService.resetPassword(
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
  }),
};

export default authController;