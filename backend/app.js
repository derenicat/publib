import express from 'express';
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

import globalErrorHandler from './src/middlewares/errorMiddleware.js';
import AppError from './src/utils/appError.js';

const app = express();

// Core Middlewares
app.use(helmet()); // Set security HTTP headers

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  max: 100, // Max requests per IP
  windowMs: 60 * 60 * 1000, // Per hour
  message: 'Too many requests from this IP, please try again in an hour.',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Parses incoming JSON requests
app.use(cookieParser()); // Parses incoming cookies (req.cookies)

// Data sanitization against NoSQL query injection and XSS
app.use(mongoSanitize()); // Removes '$' and '.' from request body, query, and params
app.use(xss()); // Cleans user input from malicious HTML code

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/lists', userListRoutes);
app.use('/api/library-entries', libraryEntryRoutes);
app.use('/api/movies', movieRoutes); // To be implemented

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;