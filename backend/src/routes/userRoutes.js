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
import { protect, restrictTo, isLoggedIn } from '../middlewares/authMiddleware.js'; // isLoggedIn eklendi
import followRouter from './followRoutes.js';

const router = express.Router();

// Mount the followRouter at the root.
// Requests will first be checked against followRouter's specific routes.
// If no match, control will pass to the next routes in this file.
router.use('/', followRouter);

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
  .get(isLoggedIn, getUserById) // isLoggedIn eklendi: Kullanıcı giriş yapmışsa takip durumunu görebilir
  .patch(protect, restrictTo('admin'), updateUser) // Korumalı: Sadece 'admin' rolündeki kullanıcılar güncelleyebilir.
  .delete(protect, restrictTo('admin'), deleteUser); // Korumalı: Sadece 'admin' rolündeki kullanıcılar silebilir.

export default router;
