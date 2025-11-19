import {
  createCustomList,
  getListsByUser,
  getList as getListService,
  deleteList as deleteListService,
} from '../services/userListService.js';
import catchAsync from '../utils/catchAsync.js';
import { UserList } from '../models/index.js'; // For checkOwnership middleware

export const createList = catchAsync(async (req, res, next) => {
  const { name, description, isPublic } = req.body;
  const userId = req.user.id;

  const newList = await createCustomList({
    userId,
    name,
    description,
    isPublic,
  });

  res.status(201).json({
    status: 'success',
    data: {
      list: newList,
    },
  });
});

export const getAllMyLists = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const lists = await getListsByUser(userId);

  res.status(200).json({
    status: 'success',
    results: lists.length,
    data: {
      lists,
    },
  });
});

export const getList = catchAsync(async (req, res, next) => {
  const { id: listId } = req.params;
  const requestingUser = req.user; // Can be null if not logged in, handled by service

  const list = await getListService(listId, requestingUser);

  res.status(200).json({
    status: 'success',
    data: {
      list,
    },
  });
});

export const deleteList = catchAsync(async (req, res, next) => {
  const { id: listId } = req.params;
  // Not: Liste sahiplik kontrolü ilgili middleware tarafından önceden yapılmıştır.

  await deleteListService(listId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});