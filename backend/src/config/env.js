import dotenv from 'dotenv';

// .env dosyasından ortam değişkenlerini yükle
dotenv.config({ path: './.env' });

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'DATABASE_PASSWORD',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD',
  'EMAIL_FROM',
  'GOOGLE_BOOKS_API_KEY',
  'GOOGLE_BOOKS_API_URL',
  'TMDB_API_KEY',
  'TMDB_API_URL',
];

// Gerekli tüm ortam değişkenlerinin mevcut olup olmadığını kontrol et
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
  GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY,
  GOOGLE_BOOKS_API_URL: process.env.GOOGLE_BOOKS_API_URL,
  TMDB_API_KEY: process.env.TMDB_API_KEY,
  TMDB_API_URL: process.env.TMDB_API_URL,
};

export default config;
