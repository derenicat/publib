// =================================================================
// YAKALANMAYAN İSTİSNA YÖNETİCİSİ
// Not: Bu yöneticinin diğer tüm kodlardan ÖNCE olması kritik öneme sahiptir.
// =================================================================
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);
  console.error('Stack:', err.stack);
  // 1, yakalanmayan istisna anlamına gelir
  process.exit(1);
});

import app from './app.js';
import connectDB from './src/config/db.js';
import config from './src/config/env.js';

const port = config.PORT || 3000;

let server;

const startServer = async () => {
  try {
    // İlk olarak, veritabanına bağlan
    await connectDB();

    // Sunucuyu yalnızca veritabanı bağlantısı başarılı olursa başlat
    server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// =================================================================
// İŞLENMEYEN REDDEDİLMELER YÖNETİCİSİ
// =================================================================
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error('Error:', err.name, err.message);

  // Sunucuyu düzenli bir şekilde kapat (mevcut isteklerin bitmesini bekle)
  if (server) {
    server.close(() => {
      // 1, yakalanmayan istisna anlamına gelir
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
