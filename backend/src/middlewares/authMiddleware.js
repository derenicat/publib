import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { User } from '../models/index.js';
import { verifyToken } from '../utils/jwtHelper.js'; // Import verifyToken from the helper

const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Check for the token's existence (from cookie or Authorization header)
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify the token using the central helper function
  const decoded = await verifyToken(token);

  // 3) Check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // Development environment logging
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[DEV LOG] JWT Verified. User ID: ${currentUser._id}, Email: ${currentUser.email}`
    );
  }

  // 5) Grant access to the protected route by attaching the user to the request
  req.user = currentUser;
  next();
});

export { protect };
