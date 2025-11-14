import AppError from '../utils/appError.js';

// Handles Mongoose CastError (e.g., invalid ObjectId)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handles Mongoose duplicate key error (code: 11000)
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

// Handles Mongoose validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handles JWT signature errors
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

// Handles JWT expiration errors
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Function to send detailed errors in the development environment
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Function to send clean, meaningful errors in the production environment
const sendErrorProd = (err, res) => {
  // Operational, trusted errors: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or other unknown errors
  // 1) Log the error
  console.error('ERROR 💥', err);

  // 2) Send a generic message
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong on the server.',
  });
};

// Main Global Error Handler Middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    // We can use the `err` object directly instead of cloning it.
    // However, sometimes cloning prevents unexpected side effects.
    let error = { ...err, message: err.message, name: err.name };
    error.errmsg = err.errmsg; // Make sure to copy errmsg as well

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  } else {
    // In development mode, send all details
    sendErrorDev(err, res);
  }
};

export default globalErrorHandler;
