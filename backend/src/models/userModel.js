import mongoose from 'mongoose';
import crypto from 'crypto';
import validator from 'validator';
import {
  hashPassword,
  comparePassword as comparePasswordsHelper,
} from '../utils/hashHelper.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'A username is required.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'An email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'A password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match!',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    passwordChangedAt: Date, // Field to store the last password change date
    passwordResetToken: String,
    passwordResetExpires: Date,
    avatarUrl: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },

  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// AKTİF KULLANICI FİLTRELEME MİDDLEWARE'İ (ACTIVE USER FILTERING):
// Herhangi bir "find" sorgusu öncesinde otomatik olarak `active: { $ne: false }` koşulunu ekler.
// Bu sayede silinmiş veya pasif hale getirilmiş kullanıcılar,
// açıkça talep edilmedikçe sorgu sonuçlarına dahil edilmez.
userSchema.pre(/^find/, function (next) {
  // 'this' points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// ŞİFRE HASHLEME VE GÜNCELLEME MİDDLEWARE'İ (PASSWORD HASHING & UPDATE):
// Kullanıcı belgesi kaydedilmeden (save) önce çalışır.
// Eğer şifre alanı değiştirilmişse:
// 1. Şifreyi güvenli bir şekilde hashler (`hashHelper` kullanarak).
// 2. `passwordConfirm` alanını veritabanına kaydetmemek için siler.
// 3. Eğer belge yeni değilse (yani mevcut bir kullanıcı güncelleniyorsa),
//    `passwordChangedAt` alanını günceller. Bu, eski token'ların geçersiz kılınmasında kullanılır.
userSchema.pre('save', async function (next) {
  // Sadece şifre alanı değiştirilmişse veya yeniyse bu fonksiyonu çalıştır
  if (!this.isModified('password')) return next();

  this.password = await hashPassword(this.password);

  this.passwordConfirm = undefined;

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Token'ın bu tarihten sonra oluşturulduğundan emin olmak için 1 saniye geri al
  }

  next();
});

// ŞİFRE KARŞILAŞTIRMA METODU (PASSWORD COMPARISON METHOD):
// Kullanıcının girdiği düz metin şifreyi, veritabanında kayıtlı hashlenmiş şifre ile karşılaştırır.
// Bu, kimlik doğrulama sürecinde kullanılır ve şifrenin asla düz metin olarak saklanmamasını sağlar.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await comparePasswordsHelper(candidatePassword, this.password);
};

// ŞİFRE DEĞİŞİMİ KONTROL METODU (PASSWORD CHANGE CHECK METHOD):
// Bir JWT token'ının verildiği tarihten sonra kullanıcının şifresini değiştirip değiştirmediğini kontrol eder.
// Güvenlik için kritik bir mekanizmadır; şifre değiştikten sonra eski token'ın
// geçersiz sayılmasını sağlar ve çalınan token'ların kullanımını engeller.
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // JWT, şifre değişiminden önce oluşturulmuşsa 'true' döner (yani eski token)
    return JWTTimestamp < changedTimestamp;
  }

  // Şifre hiç değiştirilmemişse, token her zaman geçerlidir.
  return false;
};

// ŞİFRE SIFIRLAMA TOKEN'I OLUŞTURMA METODU (PASSWORD RESET TOKEN CREATION METHOD):
// Kullanıcının şifresini sıfırlaması için kullanılan tek kullanımlık bir token oluşturur.
// Güvenlik için, iki farklı token üretilir:
// 1. Hashlenmemiş Token (`resetToken`): Kullanıcıya e-posta ile gönderilir.
// 2. Hashlenmiş Token (`this.passwordResetToken`): Veritabanına kaydedilir.
// Bu ayrım, veritabanı sızdırılsa bile, saldırganların şifre sıfırlama token'ını
// doğrudan kullanamamasını sağlar. Token'ın ayrıca kısa bir geçerlilik süresi vardır.
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
