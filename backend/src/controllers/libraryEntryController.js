import {
  addToList,
  getEntriesByList as getEntriesByListService,
  removeFromList,
} from '../services/libraryEntryService.js';
import catchAsync from '../utils/catchAsync.js';

export const addEntry = catchAsync(async (req, res, next) => {
  const { googleBooksId, listName, status } = req.body;
  const userId = req.user.id;

  const newEntry = await addToList({
    userId,
    googleBooksId,
    listName,
    status,
  });

  res.status(201).json({
    status: 'success',
    data: {
      entry: newEntry,
    },
  });
});

export const getEntriesByList = catchAsync(async (req, res, next) => {
  const { listId } = req.params;
  // Not: Liste sahiplik/genel erişim kontrolü `userListController.getList` veya ilgili middleware tarafından yapılır.

  const entries = await getEntriesByListService(listId);

  res.status(200).json({
    status: 'success',
    results: entries.length,
    data: {
      entries,
    },
  });
});

export const removeEntry = catchAsync(async (req, res, next) => {
  const { id: entryId } = req.params;
  // Not: Bu girişin sahiplik kontrolü ilgili middleware tarafından önceden yapılmıştır.

  await removeFromList(entryId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});