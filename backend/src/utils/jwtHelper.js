import jwt from 'jsonwebtoken';
import { promisify } from 'util';

// Get JWT secret and expiration from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_SECRET || !JWT_EXPIRES_IN) {
  throw new Error(
    'JWT_SECRET and JWT_EXPIRES_IN environment variables must be defined!'
  );
}

export const convertExpiresInToMs = (expiresIn) => {
  const value = parseInt(expiresIn);
  const unit = expiresIn.replace(value, '');

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      // Default to days if no unit or unknown unit is provided, or throw an error
      // For now, we'll assume 'd' if no unit is specified, matching common JWT library behavior
      return value * 24 * 60 * 60 * 1000;
  }
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Promisify jwt.verify to use it with async/await
const verifyAsync = promisify(jwt.verify);

export const verifyToken = async (token) => {
  // The try-catch block has been removed.
  // Any error (e.g., TokenExpiredError, JsonWebTokenError) will now propagate
  // up to the catchAsync wrapper, which then passes it to our global error handler.
  // This centralizes error handling and prevents swallowing errors.
  return await verifyAsync(token, JWT_SECRET);
};
