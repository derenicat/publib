import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { User } from "../models/index.js";
import { verifyToken } from "../utils/jwtHelper.js";
import TokenBlacklist from "../models/tokenBlacklistModel.js";

// OPSİYONEL KİMLİK DOĞRULAMA:
// Token varsa kullanıcıyı bulup req.user'a atar, yoksa hata vermeden devam eder.
// Hem giriş yapmış hem de yapmamış kullanıcıların erişebileceği ama farklı içerik
// göreceği rotalar için kullanılır.
const isLoggedIn = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Token yoksa devam et (req.user undefined kalır)
  if (!token) return next();

  try {
    const decoded = await verifyToken(token);

    // Token karaliste kontrolü
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) return next();

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    // Şifre değişimi kontrolü
    if (currentUser.changedPasswordAfter(decoded.iat)) return next();

    // Başarılı: Kullanıcıyı request'e ekle
    req.user = currentUser;
    return next();
  } catch (err) {
    // Herhangi bir hatada (token geçersiz vs.) sessizce devam et
    return next();
  }
};

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = await verifyToken(token);

  const isBlacklisted = await TokenBlacklist.findOne({ token });
  if (isBlacklisted) {
    return next(
      new AppError("This token has been invalidated. Please log in again.", 401)
    );
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[DEV LOG] JWT Verified. User ID: ${currentUser._id}, Email: ${currentUser.email}`
    );
  }

  req.user = currentUser;
  req.user.exp = decoded.exp;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};

const checkOwnership = Model =>
  catchAsync(async (req, res, next) => {
    const { id: resourceId } = req.params;
    const { user: requestingUser } = req;

    const doc = await Model.findById(resourceId);

    if (!doc) {
      return next(new AppError("No document found with that ID.", 404));
    }

    if (
      doc.user &&
      doc.user.toString() !== requestingUser.id &&
      requestingUser.role !== "admin"
    ) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    next();
  });

export { protect, restrictTo, checkOwnership, isLoggedIn };