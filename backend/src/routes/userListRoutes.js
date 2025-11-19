import express from 'express';
import { createList, getAllMyLists, getList, deleteList } from '../controllers/userListController.js';
import { protect, checkOwnership } from '../middlewares/authMiddleware.js';
import { createListValidator, listIdValidator } from '../middlewares/validators/libraryValidator.js';
import { UserList } from '../models/index.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(createListValidator, createList)
  .get(getAllMyLists);

router
  .route('/:id')
  .get(getList)
  .delete(listIdValidator, checkOwnership(UserList), deleteList);

export default router;
