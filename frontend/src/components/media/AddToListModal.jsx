import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import userListService from '../../services/userListService';
import libraryEntryService from '../../services/libraryEntryService';
import toast from 'react-hot-toast'; // Import toast

const BOOK_STATUSES = [
  { value: 'WANT_TO_READ', label: 'Want to Read' },
  { value: 'READING', label: 'Reading' },
  { value: 'READ', label: 'Read' }
];

const MOVIE_STATUSES = [
  { value: 'WANT_TO_WATCH', label: 'Want to Watch' },
  { value: 'WATCHING', label: 'Watching' },
  { value: 'WATCHED', label: 'Watched' }
];

const AddToListModal = ({ isOpen, onClose, item, type, onSuccess }) => {
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [selectedList, setSelectedList] = useState('');
  const [status, setStatus] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false); // Güncelleme modu

  // Modal açıldığında listeleri çek ve ilk listeyi seç
  useEffect(() => {
    if (!isOpen) return; // Modal kapalıysa işlem yapma

    const fetchAndSetInitialData = async () => {
      setLoadingLists(true);
      setError(null);
      setLists([]); // Her açılışta listeleri sıfırla

      try {
        const response = await userListService.getMyLists();
        if (response.data && response.data.lists) {
          const filteredLists = response.data.lists.filter(
            (list) => list.type.toLowerCase() === type.toLowerCase()
          );
          setLists(filteredLists);
          
          if (filteredLists.length > 0) {
            const firstListId = filteredLists[0].id || filteredLists[0]._id || filteredLists[0].detailPageId;
            setSelectedList(firstListId);
            // Aşağıdaki useEffect selectedList değişimini yakalayıp isUpdateMode ve status'ü ayarlayacak.
          } else {
            setSelectedList(''); 
            setIsUpdateMode(false);
            const defaultStatus = type === 'book' ? 'WANT_TO_READ' : 'WANT_TO_WATCH';
            setStatus(defaultStatus);
          }
        }
      } catch (err) {
        console.error("Listeler çekilemedi:", err);
        toast.error("Failed to load your lists."); // setError yerine toast.error
      } finally {
        setLoadingLists(false);
      }
    };

    fetchAndSetInitialData();
  }, [isOpen, type, item]); // item da değişirse tetiklensin

  // Seçili liste, item veya listeler değiştiğinde update modunu ve statüyü ayarla
  useEffect(() => {
    console.log('[DEBUG-UI] useEffect triggered. Selected List:', selectedList); // DEBUG
    console.log('[DEBUG-UI] Item for comparison:', item); // DEBUG

    if (!selectedList || lists.length === 0) {
      setIsUpdateMode(false);
      const defaultStatus = type === 'book' ? 'WANT_TO_READ' : 'WANT_TO_WATCH';
      setStatus(defaultStatus);
      return;
    }

    const currentList = lists.find(l => (l.id || l._id || l.detailPageId) === selectedList);
    if (!currentList || !currentList.entries) {
      setIsUpdateMode(false);
      const defaultStatus = type === 'book' ? 'WANT_TO_READ' : 'WANT_TO_WATCH';
      setStatus(defaultStatus);
      return;
    }
    console.log('[DEBUG-UI] Current List:', currentList); // DEBUG
    console.log('[DEBUG-UI] Current List Entries:', currentList.entries); // DEBUG

    const targetItemId = item.detailPageId || item._id || item.id || item.googleBooksId || item.tmdbId;
    console.log('[DEBUG-UI] Target Item ID (detailPageId preferred):', targetItemId); // DEBUG

    const existingEntry = currentList.entries.find(entry => {
      const entryItem = entry.item; 
      if (!entryItem) return false;

      // Backend toJSON transformasyonu _id ve id'yi silip detailPageId yapıyor.
      // Bu yüzden listeden gelen entryItem içinde detailPageId var.
      
      // 1. detailPageId Eşleşmesi (En güvenilir yöntem)
      // targetItemId genelde detailPageId'dir.
      const matchDetailId = entryItem.detailPageId && entryItem.detailPageId.toString() === targetItemId.toString();

      // 2. TMDB ID Eşleşmesi (Yedek)
      const matchTmdb = item.tmdbId && entryItem.tmdbId && entryItem.tmdbId.toString() === item.tmdbId.toString();

      // 3. Google Books ID Eşleşmesi (Yedek)
      const matchGoogle = item.googleBooksId && entryItem.googleBooksId && entryItem.googleBooksId === item.googleBooksId;

      console.log(`  [DEBUG-UI] Comparing entryItem (${entryItem.title}): DetailID:${matchDetailId}, TMDB:${matchTmdb}, Google:${matchGoogle}`); // DEBUG

      return matchDetailId || matchTmdb || matchGoogle;
    });

    if (existingEntry) {
      console.log('[DEBUG-UI] Existing entry found:', existingEntry); // DEBUG
      setIsUpdateMode(true);
      setStatus(existingEntry.status); // Mevcut statüyü otomatik seç
    } else {
      console.log('[DEBUG-UI] No existing entry found for selected list.'); // DEBUG
      setIsUpdateMode(false);
      const defaultStatus = type === 'book' ? 'WANT_TO_READ' : 'WANT_TO_WATCH';
      setStatus(defaultStatus);
    }

  }, [selectedList, lists, item, type]); // Bağımlılıklar güncel

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedList || !status) return;

    setSubmitting(true);
    setError(null);

    try {
      const itemId = item.detailPageId || item.id || item._id || item.googleBooksId || item.tmdbId;
      const itemModel = type === 'book' ? 'Book' : 'Movie';

      await libraryEntryService.addEntry({
        list: selectedList,
        item: itemId,
        itemModel,
        status
      });

      toast.success('Item added to your list!'); // onSuccess() yerine toast
      onClose();
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add item to list.'); // setError yerine toast.error
    } finally {
      setSubmitting(false);
    }
  };

  const statuses = type === 'book' ? BOOK_STATUSES : MOVIE_STATUSES;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${isUpdateMode ? 'Update in' : 'Add to'} List: ${item?.title}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger/10 border border-danger text-danger text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {loadingLists ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center text-secondary py-4">
            You don't have any {type} lists yet. Please create one first.
          </div>
        ) : (
          <>
            {/* List Selection */}
            <div>
              <label htmlFor="list" className="block text-sm font-medium text-gray-300 mb-1">
                Select List
              </label>
              <select
                id="list"
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors appearance-none"
              >
                {lists.map((list) => (
                  <option key={list.id || list._id || list.detailPageId} value={list.id || list._id || list.detailPageId}>
                    {list.name}
                  </option>
                ))}
              </select>
              {isUpdateMode && (
                <p className="text-brand-400 text-xs mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  This item is already in this list. Current Status: <span className="font-bold">{status.replace(/_/g, ' ')}</span>
                </p>
              )}
            </div>

            {/* Status Selection */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors appearance-none"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-full font-bold text-white transition-all ${
                submitting 
                ? 'bg-brand-700 cursor-not-allowed opacity-70' 
                : isUpdateMode
                    ? 'bg-surface-accent border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white'
                    : 'bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40'
              }`}
            >
              {submitting ? (isUpdateMode ? 'Updating...' : 'Adding...') : (isUpdateMode ? 'Update Entry' : 'Add to List')}
            </button>
          </>
        )}
      </form>
    </Modal>
  );
};

export default AddToListModal;