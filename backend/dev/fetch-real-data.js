import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import { ensureMovieExists } from '../src/services/movieService.js';
import { ensureBookExists } from '../src/services/bookService.js';
import config from '../src/config/env.js';

// Ortam değişkenlerini yükle (config dosyasından önce manuel yüklemek gerekebilir çünkü config dosyası process.env kullanır)
dotenv.config({ path: './.env' });

// MongoDB Bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.DATABASE_URL.replace(
        '<PASSWORD>',
        process.env.DATABASE_PASSWORD
      )
    );
    console.log('DB Connected!');
  } catch (err) {
    console.error('DB Connection Error:', err);
    process.exit(1);
  }
};

// TMDB'den Film Listesi Çek
const fetchMovies = async (page) => {
  console.log(`Fetching Movies - Page: ${page}...`);
  try {
    // Popular movies endpoint
    const response = await axios.get(
      `${process.env.TMDB_API_URL}/movie/top_rated`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          page: page,
        },
      }
    );

    const movies = response.data.results;
    console.log(`Found ${movies.length} movies. Processing details...`);

    for (const movie of movies) {
      try {
        // ensureMovieExists: Yoksa çeker, detaylandırır ve kaydeder.
        const savedMovie = await ensureMovieExists(movie.id.toString());
        console.log(`✅ Saved/Updated: ${savedMovie.title}`);
      } catch (err) {
        console.error(`❌ Error saving movie ${movie.id}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('TMDB API Error:', err.message);
  }
};

// Google Books'tan Kitap Listesi Çek
const fetchBooks = async (page) => {
  const startIndex = (page - 1) * 20; // Google Books 0-indexed ve max 40 results, biz 20'şer gidelim
  console.log(`Fetching Books - Page: ${page} (StartIndex: ${startIndex})...`);

  try {
    // Genel bir arama terimi (örn: 'fiction' veya 'subject:fiction')
    // Google Books 'volumes' endpoint
    const response = await axios.get(process.env.GOOGLE_BOOKS_API_URL, {
      params: {
        key: process.env.GOOGLE_BOOKS_API_KEY,
        q: 'subject:comics+graphic+novels+/+east+asian+style+/+general', // Genel bir kategori
        startIndex: startIndex,
        maxResults: 20,
        printType: 'books',
        langRestrict: 'en',
        orderBy: 'relevance', // Sorgu stabilitesi için eklendi
      },
    });

    const books = response.data.items || [];
    console.log(`Found ${books.length} books. Processing details...`);

    for (const book of books) {
      try {
        // ensureBookExists: Yoksa çeker, detaylandırır ve kaydeder.
        const savedBook = await ensureBookExists(book.id);
        console.log(`✅ Saved/Updated: ${savedBook.title}`);
      } catch (err) {
        console.error(`❌ Error saving book ${book.id}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Google Books API Error:', err.message);
  }
};

// Ana Çalıştırma Fonksiyonu
const run = async () => {
  await connectDB();

  // Komut satırı argümanlarını parse et
  // Kullanım: node dev/fetch-real-data.js --type=movie --page=1
  const args = process.argv.slice(2);
  const typeArg = args.find((arg) => arg.startsWith('--type='));
  const pageArg = args.find((arg) => arg.startsWith('--page='));

  if (!typeArg || !pageArg) {
    console.error(
      'Usage: node dev/fetch-real-data.js --type=<movie|book> --page=<number>'
    );
    process.exit(1);
  }

  const type = typeArg.split('=')[1];
  const page = parseInt(pageArg.split('=')[1]);

  if (type === 'movie') {
    await fetchMovies(page);
  } else if (type === 'book') {
    await fetchBooks(page);
  } else {
    console.error('Invalid type. Use "movie" or "book".');
  }

  console.log('✨ Done!');
  process.exit();
};

run();
