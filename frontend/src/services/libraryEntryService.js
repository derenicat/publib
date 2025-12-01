import api from './api';

const libraryEntryService = {
  // Listeye öğe ekle
  addEntry: async (entryData) => {
    // entryData: { list: listId, item: itemId, itemModel: 'Book'|'Movie', status }
    const response = await api.post('/library-entries', entryData);
    return response.data;
  },

  // Listeden öğe sil
  removeEntry: async (entryId) => {
    const response = await api.delete(`/library-entries/${entryId}`);
    return response.data;
  },

  // Öğenin durumunu güncelle (örn: Reading -> Read)
  updateEntryStatus: async (entryId, status) => {
    const response = await api.patch(`/library-entries/${entryId}`, { status });
    return response.data;
  }
};

export default libraryEntryService;
