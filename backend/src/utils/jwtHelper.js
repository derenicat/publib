import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import config from '../config/env.js';

// Get JWT secret and expiration from centralized config
const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRES_IN = config.JWT_EXPIRES_IN;

// JWT SÜRE DÖNÜŞTÜRÜCÜ:
// Ortam değişkenlerinden okunan JWT geçerlilik süresini (örn: "90d", "1h")
// milisaniye cinsinden sayısal bir değere dönüştürür.
// Bu, çerezlerin (`maxAge`) ve diğer süre bazlı işlemlerin doğru şekilde ayarlanmasını sağlar.
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
      // Varsayılan olarak gün kabul edilir.
      return value * 24 * 60 * 60 * 1000;
  }
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// JWT DOĞRULAMA VE MERKEZİ HATA YÖNETİMİ:
// Verilen JWT token'ını doğrular. Doğrulama sırasında oluşabilecek tüm hatalar
// (örn: geçersiz token, süresi dolmuş token) `try-catch` bloğu yerine
// `catchAsync` yardımcı fonksiyonu aracılığıyla global hata yöneticimize (`errorMiddleware`) iletilir.
// Bu, hata yönetimini merkezileştirerek kod tekrarını önler ve hata sarmasını engeller.
const verifyAsync = promisify(jwt.verify);

export const verifyToken = async (token) => {
  return await verifyAsync(token, JWT_SECRET);
};
