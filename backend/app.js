import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import bookRoutes from './src/routes/bookRoutes.js';
import userListRoutes from './src/routes/userListRoutes.js';
import libraryEntryRoutes from './src/routes/libraryEntryRoutes.js';
import movieRoutes from './src/routes/movieRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import activityRoutes from './src/routes/activityRoutes.js';

import globalErrorHandler from './src/middlewares/errorMiddleware.js';
import AppError from './src/utils/appError.js';

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true, // Allow cookies
  })
);

// Temel Ara Yazılımlar
app.use(helmet()); // Güvenlik HTTP başlıklarını ayarlar

// Kaba kuvvet saldırılarını önlemek için hız sınırlaması
const limiter = rateLimit({
  max: 35000, // IP başına maksimum istek (Geliştirme için artırıldı)
  windowMs: 60 * 60 * 1000, // Saat başına
  message: 'Too many requests from this IP, please try again in an hour.',
});

app.use('/api', limiter);

// Gövde ayrıştırıcı, gövdeden gelen veriyi req.body'ye okur
app.use(express.json({ limit: '10kb' })); // Gelen JSON isteklerini ayrıştırır
app.use(cookieParser()); // Gelen çerezleri ayrıştırır (req.cookies)

// NoSQL sorgu enjeksiyonu ve XSS'ye karşı veri temizleme
app.use(mongoSanitize()); // İstek gövdesi, sorgu ve parametrelerden '$' and '.' from request body, query, and params
app.use(xss()); // Kullanıcı girişini kötü amaçlı HTML kodlarından temizler

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/lists', userListRoutes);
app.use('/api/library-entries', libraryEntryRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/feed', activityRoutes);

// Tanımlanmamış rotalar için hepsini yakala
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Hata İşleme Ara Yazılımı
app.use(globalErrorHandler);

export default app;
