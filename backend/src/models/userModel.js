import mongoose from 'mongoose';
import crypto from 'crypto';
import validator from 'validator';
import {
  hashPassword,
  comparePassword as comparePasswordsHelper,
} from '../utils/hashHelper.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'A username is required.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'An email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'A password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
      select: false, // Ensures this field is not returned in queries by default
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        // This custom validator only works on CREATE and SAVE!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match!',
      },
    },
    passwordChangedAt: Date, // Field to store the last password change date
    passwordResetToken: String,
    passwordResetExpires: Date,
    avatarUrl: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    // Other embedded fields (library, followers, etc.) will be added here
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Query Middleware: Automatically filter out inactive users
userSchema.pre(/^find/, function (next) {
  // 'this' points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// MIDDLEWARE THAT RUNS BEFORE A DOCUMENT IS SAVED
userSchema.pre('save', async function (next) {
  // Only run this function if the password field was modified or is new
  if (!this.isModified('password')) return next();

  // Hash the password using the hashHelper
  this.password = await hashPassword(this.password);

  // Remove the passwordConfirm field so it's not persisted to the DB
  this.passwordConfirm = undefined;

  // If the document is not new and password was modified, set the passwordChangedAt field
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token is created after this timestamp
  }

  next();
});

// SCHEMA METHOD: COMPARES THE ENTERED PASSWORD WITH THE HASH IN THE DB
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await comparePasswordsHelper(candidatePassword, this.password);
};

// SCHEMA METHOD: CHECKS IF PASSWORD WAS CHANGED AFTER THE TOKEN WAS ISSUED
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; // True if password was changed after token was issued
  }

  // False means password was never changed
  return false;
};

// SCHEMA METHOD: CREATES A PASSWORD RESET TOKEN
userSchema.methods.createPasswordResetToken = function () {
  // 1. Generate a random, unhashed token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash the token and save it to the user document
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set the expiration date for the token (e.g., 10 minutes from now)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // 4. Return the unhashed token so it can be sent to the user
  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
