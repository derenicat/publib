import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { User } from "../models/index.js";
import { verifyToken } from "../utils/jwtHelper.js";
import TokenBlacklist from "../models/tokenBlacklistModel.js"; // Import the TokenBlacklist model

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

  // TOKEN KARALİSTESİ KONTROLÜ (TOKEN BLACKLISTING):
  // Kullanıcı çıkış yaptığında, ilgili JWT token'ı bir karalisteye alınır.
  // Bu kontrol, ele geçirilmiş veya süresi dolmamış dahi olsa,
  // karalisteye alınmış bir token'ın yetkilendirme için kullanılmasını engeller.
  // Bu sayede eski veya geçersiz token'larla yetkisiz erişim önlenir.
  console.log(`[DEV LOG] Checking token against blacklist: ${token}`);
  const isBlacklisted = await TokenBlacklist.findOne({ token });
  console.log(`[DEV LOG] Is token blacklisted?`, isBlacklisted);
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

  // ŞİFRE DEĞİŞİMİ SONRASI TOKEN GEÇERSİZLİĞİ:
  // Kullanıcı token verildikten sonra şifresini değiştirmişse, mevcut token'ın
  // otomatik olarak geçersiz kılınmasını sağlar. Bu, çalınan bir token'ın
  // şifre değişikliği sonrasında bile kullanılmasını önleyerek güvenliği artırır.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // Development environment logging
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[DEV LOG] JWT Verified. User ID: ${currentUser._id}, Email: ${currentUser.email}`
    );
  }

  req.user = currentUser;
  req.user.exp = decoded.exp; // Attach token expiration to req.user for logout service
  next();
});

// ROL BAZLI ERİŞİM KONTROLÜ (ROLE-BASED ACCESS CONTROL - RBAC):
// Belirli bir rotaya yalnızca tanımlanmış rollere (örn: 'admin', 'moderator')
// sahip kullanıcıların erişmesini sağlar. `protect` middleware'i sonrasında çalışır.
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array, e.g., ['admin', 'lead-guide']
    // req.user is available from the 'protect' middleware
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};

// KAYNAK SAHİPLİĞİ KONTROLÜ:
// Bir kaynağın (belgenin) yalnızca kendi sahibi veya 'admin' rolüne sahip
// kullanıcılar tarafından değiştirilmesini/silinmesini sağlar.
// Örneğin, bir kullanıcının başkasının kitap listesini silmesini engeller.
const checkOwnership = Model =>
  catchAsync(async (req, res, next) => {
    const { id: resourceId } = req.params;
    const { user: requestingUser } = req;

    const doc = await Model.findById(resourceId);

    if (!doc) {
      return next(new AppError("No document found with that ID.", 404));
    }

    // Check if the resource has a 'user' field and if that user is the one making the request.
    // Also allow admins to bypass this check.
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

export { protect, restrictTo, checkOwnership };
