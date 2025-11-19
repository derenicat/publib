import express from 'express';
import {
  getMe,
  updateMyData,
  updateMyPassword,
  deleteMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Public Routes ---
// Herkesin tüm kullanıcıları listeleyebileceği genel rota.
router.get('/', getAllUsers);

// --- KORUMALI KULLANICIYA ÖZEL ROTLAR ---
// Bu rotalar, o anki giriş yapmış kullanıcıya özel işlemler içindir.
// Express'in doğru eşleştirme yapması için dinamik '/:id' rotasından önce yerleştirilmiştir.
router.get('/me', protect, getMe, getUserById);
router.patch('/update-my-password', protect, updateMyPassword);
router.patch('/me', protect, updateMyData);
router.delete('/me', protect, deleteMe);

// --- YÖNETİCİ VE GENEL DİNAMİK ROTLAR ---
// Bu rotalar, URL'de sağlanan kullanıcı ID'sine göre işlemleri yönetir.
router
  .route('/:id')
  .get(getUserById) // Genel: Herkes bir kullanıcının herkese açık profilini ID ile alabilir.
  .patch(protect, restrictTo('admin'), updateUser) // Korumalı: Sadece 'admin' rolündeki kullanıcılar güncelleyebilir.
  .delete(protect, restrictTo('admin'), deleteUser); // Korumalı: Sadece 'admin' rolündeki kullanıcılar silebilir.

export default router;
