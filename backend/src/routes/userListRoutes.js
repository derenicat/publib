import express from 'express';
import {
  createList,
  getAllMyLists,
  getList,
  deleteList,
  getPublicLists,
  getAllLists,
} from '../controllers/userListController.js';
import { protect, checkOwnership } from '../middlewares/authMiddleware.js';
import {
  createListValidator,
  listIdValidator,
} from '../middlewares/validators/libraryValidator.js';
import { userIdValidator } from '../middlewares/validators/userValidator.js';
import { UserList } from '../models/index.js';

const router = express.Router();

// --- Public Routes ---

// 1. Platformdaki tüm herkese açık listeleri getir (Discover)
router.get('/', getAllLists);

// 2. Belirli bir kullanıcının herkese açık listelerini getir
router.get('/user/:userId', userIdValidator, getPublicLists);

// --- PROTECTED ROUTES (Giriş yapmış kullanıcıya özel rotalar) ---
// Bu rotalar, daha spesifik oldukları için genel rotalardan önce gelmelidir.

// 3. Giriş yapmış kullanıcının kendi listelerini getir
router.get('/me', protect, getAllMyLists);

// 4. Yeni liste oluştur
router.post('/', protect, createListValidator, createList);

// --- Generic List ID Routes (mixed public/protected access) ---
router
  .route('/:id')
  .get(getList) // Bu rota, liste gizli değilse herkese açık olabilir. Erişim kontrolü servis katmanında.
  .delete(protect, listIdValidator, checkOwnership(UserList), deleteList); // Silme işlemi korumalıdır.


export default router;
