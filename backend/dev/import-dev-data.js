import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// --- Import all models and services ---
import {
  User,
  Book,
  Movie,
  UserList,
  LibraryEntry,
  Review,
  Follow,
  Activity,
} from '../src/models/index.js';

import {
  ensureBookExists,
  searchBooks as searchGoogleBooks,
} from '../src/services/bookService.js';
import {
  ensureMovieExists,
  searchMovies as searchTMDb,
} from '../src/services/movieService.js';
import { createCustomList } from '../src/services/userListService.js';
import * as libraryEntryService from '../src/services/libraryEntryService.js';
import * as reviewService from '../src/services/reviewService.js';
import * as followService from '../src/services/followService.js';
import * as authService from '../src/services/authService.js'; // Register uses createDefaultList automatically

// --- Basic Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });
const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// --- Helper Functions ---
const getRandomItems = (arr, n) => {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

// --- Main Script ---
const connectToDB = async () => {
  try {
    await mongoose.connect(DB, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
      socketTimeoutMS: 45000,
    });
    console.log('DB connection successful!');
  } catch (err) {
    console.error('DB Connection Error:', err);
    process.exit(1);
  }
};

// --- Read Dummy Data ---
const usersJSON = JSON.parse(
  fs.readFileSync(join(__dirname, 'data', 'users.json'), 'utf-8')
);

// --- DELETE ALL EXISTING DATA ---
const deleteData = async () => {
  await connectToDB();
  try {
    console.log('Deleting all data...');
    // Order matters slightly for referencing, but deleteMany is generally safe
    await Activity.deleteMany();
    await Follow.deleteMany();
    await Review.deleteMany();
    await LibraryEntry.deleteMany();
    await UserList.deleteMany();
    await Movie.deleteMany();
    await Book.deleteMany();
    await User.deleteMany();
    console.log('All data successfully deleted!');
  } catch (err) {
    console.error('Error deleting data:', err);
  }
  process.exit();
};

// --- IMPORT DUMMY DATA ---
const importData = async () => {
  await connectToDB();
  try {
    // 1. Create Users (Admin + Regulars)
    console.log('Creating users...');
    // We use authService.register to trigger automatic default list creation
    const createdUsers = [];
    for (const userData of usersJSON) {
      // Note: We bypass the service here to avoid "email in use" if re-running without delete,
      // but for a clean seed script, we should use the service logic or replicate it.
      // However, `authService.register` returns an object without the ID sometimes depending on implementation.
      // Let's use User.create directly but MANUALLY call createDefaultList to be safe and fast,
      // OR just use the repository/service if we want the side effects.
      // Let's use `authService.register` logic manually here to ensure we have the user documents.

      // Create User
      const newUser = await User.create(userData);
      // Create Default Lists (Logic from authService)
      const { createDefaultList } = await import(
        '../src/services/userListService.js'
      );
      await createDefaultList(newUser.id);

      createdUsers.push(newUser);
    }
    console.log(`Created ${createdUsers.length} users with default lists.`);

    // 2. Search and seed BOOKS
    console.log('Seeding Books (Dune, LOTR, Harry Potter)...');
    const bookQueries = ['dune', 'lord of the rings', 'harry potter'];
    let allSeededBooks = [];

    for (const q of bookQueries) {
      const results = await searchGoogleBooks({ q, limit: 5 });
      for (const book of results) {
        // ensureBookExists returns the DB document
        const localBook = await ensureBookExists(book.googleBooksId);
        allSeededBooks.push(localBook);
      }
    }
    // Remove duplicates if any
    allSeededBooks = [
      ...new Map(allSeededBooks.map((item) => [item['id'], item])).values(),
    ];
    console.log(`Seeded ${allSeededBooks.length} unique books.`);

    // 3. Search and seed MOVIES
    console.log('Seeding Movies (Dune, LOTR, Harry Potter)...');
    const movieQueries = ['dune', 'lord of the rings', 'harry potter'];
    let allSeededMovies = [];

    for (const q of movieQueries) {
      const results = await searchTMDb({ q });
      // Results contains { results: [], ... }
      const topMovies = results.results.slice(0, 5);
      for (const movie of topMovies) {
        const localMovie = await ensureMovieExists(movie.tmdbId);
        allSeededMovies.push(localMovie);
      }
    }
    allSeededMovies = [
      ...new Map(allSeededMovies.map((item) => [item['id'], item])).values(),
    ];
    console.log(`Seeded ${allSeededMovies.length} unique movies.`);

    // 4. Simulate User Activity
    console.log('Simulating user activity...');

    const regularUsers = createdUsers.filter((u) => u.role !== 'admin');

    for (const user of regularUsers) {
      console.log(`Processing user: ${user.username}...`);

      // A. Follow 2 Random Users
      // Get potential targets (everyone except self)
      const potentialTargets = createdUsers.filter((u) => u.id !== user.id);
      const targets = getRandomItems(potentialTargets, 2);

      for (const target of targets) {
        await followService.followUser(user.id, target.id);
      }

      // B. Create Custom Lists
      const customBookList = await createCustomList({
        userId: user.id,
        name: `${user.username}'s Fav Books`,
        description: 'Hand-picked favorites.',
        isPublic: true,
        type: 'Book',
      });

      const customMovieList = await createCustomList({
        userId: user.id,
        name: `${user.username}'s Movie Night`,
        description: 'Great for weekends.',
        isPublic: true,
        type: 'Movie',
      });

      // C. Activity: BOOKS
      // Pick 5 random books to review
      const booksToReview = getRandomItems(allSeededBooks, 5);

      // Pick 2 of them to add to the custom list
      const booksForCustomList = booksToReview.slice(0, 2);

      for (const book of booksToReview) {
        // Review (Auto-adds to default list "My Books")
        await reviewService.createReview({
          userId: user.id,
          item: book.id,
          itemModel: 'Book',
          rating: Math.floor(Math.random() * 5) + 6, // Random rating 6-10
          text: `Review for ${book.title}. Automatically generated.`,
        });
      }

      for (const book of booksForCustomList) {
        await libraryEntryService.addToList({
          userId: user.id,
          item: book.id,
          itemModel: 'Book',
          list: customBookList.id,
          status: 'READ',
        });
      }

      // D. Activity: MOVIES
      // Pick 5 random movies to review
      const moviesToReview = getRandomItems(allSeededMovies, 5);

      // Pick 2 of them to add to the custom list
      const moviesForCustomList = moviesToReview.slice(0, 2);

      for (const movie of moviesToReview) {
        // Review (Auto-adds to default list "My Movies")
        await reviewService.createReview({
          userId: user.id,
          item: movie.id,
          itemModel: 'Movie',
          rating: Math.floor(Math.random() * 5) + 6, // Random rating 6-10
          text: `Review for ${movie.title}. Automatically generated.`,
        });
      }

      for (const movie of moviesForCustomList) {
        await libraryEntryService.addToList({
          userId: user.id,
          item: movie.id,
          itemModel: 'Movie',
          list: customMovieList.id,
          status: 'WATCHED',
        });
      }
    }

    console.log('--------------------------');
    console.log('Dummy data successfully loaded with complex interactions!');
  } catch (err) {
    console.error('Import Error:', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
