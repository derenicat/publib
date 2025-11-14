import userRepository from '../repositories/userRepository.js';
import { generateToken } from '../utils/jwtHelper.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';

const authService = {
  /**
   * Registers a new user.
   * @param {string} username - The username.
   * @param {string} email - The email address.
   * @param {string} password - The password.
   * @returns {Promise<object>} The registered user object.
   * @throws {AppError} Throws an error if the email is already in use.
   */
  async register(username, email, password, passwordConfirm) {
    // 1. Check if the email address is already in use
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('This email address is already in use.', 409);
    }

    // 2. Save the user to the database (password hashing and confirmation are handled automatically in the model)
    const newUser = await userRepository.create({
      username,
      email,
      password,
      passwordConfirm,
    });

    // Convert the Mongoose document to a plain object and hide the password
    const userObject = newUser.toObject();
    delete userObject.password;

    return userObject;
  },

  /**
   * Logs in a user.
   * @param {string} email - The email address.
   * @param {string} password - The password.
   * @returns {Promise<{user: object, token: string}>} The user object and JWT token.
   * @throws {AppError} Throws an error for invalid credentials.
   */
  async login(email, password) {
    // 1. Find the user by email (repository is set to also fetch the password)
    // 2. Compare the provided password using the method on the model
    const user = await userRepository.findByEmail(email);
    if (!user || (await user.comparePassword(password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 3. Create a JWT token
    const token = generateToken({ id: user.id });

    // 4. Convert the Mongoose document to a plain object and hide the password
    const userObject = user.toObject();
    // The 'password' field is already `select: false`, so it wouldn't normally be included,
    // but we ensure it's gone here.
    delete userObject.password;

    return { user: userObject, token };
  },

  async forgotPassword(email) {
    // 1. Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // To prevent email enumeration attacks, we don't reveal that the user doesn't exist.
      // We just return as if the email was sent.
      return;
    }

    // 2. Generate the random reset token using the method on the user model
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Save the user with the new token and expiration. We disable validation because we don't have passwordConfirm here.

    // 3. Send the token to the user's email
    try {
      const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      const message = `To reset your password, please click the following link: ${resetURL}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`;

      await sendEmail({
        email: user.email,
        subject: 'Publib Password Reset Request',
        message,
      });
    } catch {
      // If sending email fails, reset the token fields and save the user again
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError(
        'There was an error sending the email. Please try again later.',
        500
      );
    }
  },

  async resetPassword(token, password, passwordConfirm) {
    // 1. Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userRepository.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2. If token has not expired, and there is a user, set the new password
    if (!user) {
      throw new AppError('Token is invalid or has expired.', 400);
    }

    // 3. Set new password and clear token fields
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // 4. Save the user. The 'pre-save' middleware in the model will handle hashing the new password
    // and validating passwordConfirm.
    await user.save();

    // 5. Log the user in, send JWT
    const jwtToken = generateToken({ id: user.id });

    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject, token: jwtToken };
  },
};

export default authService;