import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Modelleri yükle
import { User, Book, Movie, UserList, LibraryEntry, Review, Follow, Activity } from '../src/models/index.js';
import { createDefaultList } from '../src/services/userListService.js';

// Ortam değişkenlerini yükle
dotenv.config({ path: './.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Bağlantısı
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD));
    console.log('DB Connected!');
  } catch (err) {
    console.error('DB Connection Error:', err);
    process.exit(1);
  }
};

// Rastgele Yardımcılar
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, count) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
// Diziden rastgele öğeler seçip çıkaran yardımcı fonksiyon (Duplicate önlemek için)
const spliceRandomSubset = (arr, count) => {
    const selected = [];
    for (let i = 0; i < count; i++) {
        if (arr.length === 0) break;
        const randomIndex = Math.floor(Math.random() * arr.length);
        selected.push(arr[randomIndex]);
        arr.splice(randomIndex, 1); // Seçilen öğeyi diziden çıkar
    }
    return selected;
};

// Yorum Metinleri
const positiveReviews = [
    "Absolutely loved it! A masterpiece.",
    "Highly recommended. Great storytelling.",
    "One of the best I've seen/read in years.",
    "Incredible characters and plot twists.",
    "A true gem. Don't miss it."
];
const neutralReviews = [
    "It was okay, nothing special.",
    "Good concepts but execution was lacking.",
    "Average experience. Had its moments.",
    "Decent, but I expected more.",
    "Not bad, but wouldn't watch/read again."
];
const negativeReviews = [
    "Terrible. Waste of time.",
    "Boring and predictable.",
    "Poorly written/directed.",
    "I couldn't even finish it.",
    "Disappointing on every level."
];

const getReviewText = (rating) => {
    if (rating >= 8) return getRandomItem(positiveReviews);
    if (rating >= 5) return getRandomItem(neutralReviews);
    return getRandomItem(negativeReviews);
};

// Liste İsimleri
const listNames = [
    "Favorites", "Must See/Read", "Weekend Vibes", "Classics", "Hidden Gems",
    "Mind Benders", "Feel Good", "Dark & Gritty", "Summer Collection", "Award Winners"
];
const listDescriptions = [
    "A collection of my absolute favorites.",
    "Things you really need to check out.",
    "Perfect for a relaxing weekend.",
    "Timeless masterpieces.",
    "Underrated stuff that deserves more love."
];

// Verileri Sil (Users ve İlişkili Veriler - Book/Movie KALSIN)
const deleteData = async () => {
  console.log('😢 Deleting data (Users, Lists, Reviews, Follows, Activities)...');
  await User.deleteMany();
  await UserList.deleteMany();
  await LibraryEntry.deleteMany();
  await Review.deleteMany();
  await Follow.deleteMany();
  await Activity.deleteMany();
  // NOT: Book ve Movie silinmiyor!
  console.log('Data successfully deleted!');

  try {
    await UserList.collection.dropIndex('user_1_name_1');
    console.log('✅ Dropped old index: user_1_name_1');
  } catch (e) {
    console.log('ℹ️ Index user_1_name_1 not found or already dropped.');
  }
  
  await UserList.collection.dropIndexes();
};

// Verileri İçe Aktar (Full Simülasyon)
const importData = async () => {
  try {
    // Önce eski verileri ve indexleri temizle
    await deleteData();

    // 1. Kullanıcıları Ekle
    const usersJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf-8'));
    console.log(`Creating ${usersJson.length} users...`);
    
    const users = [];
    for (const userData of usersJson) {
        const user = await User.create(userData); // Password hashing middleware çalışır
        await createDefaultList(user._id); // Default listeleri oluştur
        users.push(user);
    }
    console.log('✅ Users created.');

    // Kitap ve Filmleri Çek (DB'den)
    const allBooks = await Book.find().select('_id title');
    const allMovies = await Movie.find().select('_id title');
    
    if (allBooks.length === 0 || allMovies.length === 0) {
        console.error('❌ Error: No books or movies found in DB. Please run fetch scripts first.');
        process.exit(1);
    }

    // Her Kullanıcı İçin İşlemler
    for (const user of users) {
        console.log(`Processing user: ${user.username}...`);

        // Kullanıcı için havuz kopyaları oluştur (Duplicate önlemek için)
        const userAvailableBooks = [...allBooks];
        const userAvailableMovies = [...allMovies];

        // 2. Takip Et (1-40 arası)
        const otherUsers = users.filter(u => u._id.toString() !== user._id.toString());
        const usersToFollow = getRandomSubset(otherUsers, getRandomInt(1, 40));
        
        const followPromises = usersToFollow.map(targetUser => 
            Follow.create({ follower: user._id, following: targetUser._id })
        );
        await Promise.all(followPromises);

        // 3. Özel Listeler Oluştur (1 Book, 1 Movie)
        const bookListName = `${user.username}'s ${getRandomItem(listNames)}`;
        const movieListName = `${user.username}'s ${getRandomItem(listNames)}`;
        
        const customBookList = await UserList.create({
            user: user._id,
            name: bookListName,
            description: getRandomItem(listDescriptions),
            type: 'Book',
            isPublic: true
        });
        
        const customMovieList = await UserList.create({
            user: user._id,
            name: movieListName,
            description: getRandomItem(listDescriptions),
            type: 'Movie',
            isPublic: true
        });

        // Varsayılan Listeleri Bul
        const myBooksList = await UserList.findOne({ user: user._id, name: 'My Books' });
        const myMoviesList = await UserList.findOne({ user: user._id, name: 'My Movies' });

        // Helper: Rastgele LibraryEntry ve Activity Oluştur
        const createEntries = async (items, type, status, targetList) => {
            // spliceRandomSubset ile havuzdan tüketerek seçiyoruz
            const selectedItems = spliceRandomSubset(items, 10); 
            
            for (const item of selectedItems) {
                // LibraryEntry
                const entry = await LibraryEntry.create({
                    user: user._id,
                    list: targetList._id,
                    item: item._id,
                    itemModel: type,
                    status: status
                });

                // Activity
                await Activity.create({
                    user: user._id,
                    type: 'LIBRARY_ENTRY_CREATED',
                    subject: entry._id,
                    subjectModel: 'LibraryEntry'
                });

                // 6. & 7. Rating ve Review (Sadece WATCHED/READ olanlar için)
                if (status === 'WATCHED' || status === 'READ') {
                    const rating = getRandomInt(1, 10);
                    const hasText = Math.random() < 0.3; // %30 şansla metin ekle
                    
                    const reviewData = {
                        user: user._id,
                        item: item._id,
                        itemModel: type,
                        rating: rating,
                        text: hasText ? getReviewText(rating) : undefined
                    };

                    const review = await Review.create(reviewData);
                    
                    // Review Activity
                    if (hasText) {
                         await Activity.create({
                            user: user._id,
                            type: 'REVIEW_CREATED',
                            subject: review._id,
                            subjectModel: 'Review'
                        });
                    }
                    
                    // İstatistikleri güncelle (Denormalizasyon)
                    await Review.calculateStats(item._id, type);
                }
            }
        };

        // 4. & 5. Listelere Ekle (Kopyalanmış havuzları kullan)
        // Books
        await createEntries(userAvailableBooks, 'Book', 'READ', myBooksList); // 10 Read (Ratingli)
        await createEntries(userAvailableBooks, 'Book', 'WANT_TO_READ', myBooksList); // 10 Want
        await createEntries(userAvailableBooks, 'Book', 'READING', customBookList); // 10 Reading (Custom List)

        // Movies
        await createEntries(userAvailableMovies, 'Movie', 'WATCHED', myMoviesList); // 10 Watched (Ratingli)
        await createEntries(userAvailableMovies, 'Movie', 'WANT_TO_WATCH', myMoviesList); // 10 Want
        await createEntries(userAvailableMovies, 'Movie', 'WATCHING', customMovieList); // 10 Watching (Custom List)
    }

    console.log('✅ Data successfully loaded!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

// Komut satırı argümanlarını işle
const arg = process.argv[2];

if (arg === '--import') {
    connectDB().then(() => importData());
} else if (arg === '--delete') {
    connectDB().then(() => deleteData().then(() => process.exit()));
} else {
    console.log('Please specify --import or --delete');
    process.exit(1);
}