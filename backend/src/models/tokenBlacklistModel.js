import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // TTL İNDEX (TIME-TO-LIVE INDEX):
    // MongoDB'de bu alan üzerinde bir TTL (yaşam süresi) indeksi oluşturulur.
    // Bu sayede, karalisteye alınan token belgeleri, `expiresAt` tarihinde
    // otomatik olarak veritabanından silinir. Bu mekanizma, karalistenin
    // gereksiz yere büyümesini engeller ve sistem kaynaklarını verimli kullanır.
    // 'expires: 0' ayarı, belgenin tam olarak `expiresAt` tarihinde sona ereceği anlamına gelir.
    expires: 0,
  },
});

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

export default TokenBlacklist;
