import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import userListService from '../../services/userListService';

const ListModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  // Edit modu mu?
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Book',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal açıldığında veya initialData değiştiğinde formu güncelle
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        type: initialData.type || 'Book',
        isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true
      });
    } else {
      // Create modu için reset
      setFormData({
        name: '',
        description: '',
        type: 'Book',
        isPublic: true
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        // Güncelleme
        // detailPageId'yi ID olarak kullanıyoruz (backend'den gelen response'a göre)
        const listId = initialData.id || initialData.detailPageId || initialData._id;
        await userListService.updateList(listId, formData);
      } else {
        // Oluşturma
        await userListService.createList(formData);
      }
      
      onSuccess(); 
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} list.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit List" : "Create New List"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger/10 border border-danger text-danger text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
            List Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., My Favorite Sci-Fi Books"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="What is this list about?"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
          />
        </div>

        {/* List Type Selection (Radio Group) - DISABLED IN EDIT MODE */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            List Type <span className="text-secondary text-xs font-normal">(Cannot be changed {isEditMode ? '' : 'later'})</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`
              cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all
              ${formData.type === 'Book' 
                ? 'border-brand-500 bg-brand-500/10 text-brand-500' 
                : 'border-border bg-background text-secondary'}
              ${isEditMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
            `}>
              <input 
                type="radio" 
                name="type" 
                value="Book" 
                checked={formData.type === 'Book'} 
                onChange={handleChange}
                disabled={isEditMode}
                className="sr-only"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-bold">Book List</span>
            </label>

            <label className={`
              cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all
              ${formData.type === 'Movie' 
                ? 'border-brand-500 bg-brand-500/10 text-brand-500' 
                : 'border-border bg-background text-secondary'}
              ${isEditMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
            `}>
              <input 
                type="radio" 
                name="type" 
                value="Movie" 
                checked={formData.type === 'Movie'} 
                onChange={handleChange}
                disabled={isEditMode}
                className="sr-only"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="font-bold">Movie List</span>
            </label>
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between bg-background p-4 rounded-lg border border-border">
          <div>
            <span className="text-white font-medium block">Public List</span>
            <span className="text-secondary text-xs">Everyone can see this list</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="isPublic" 
              checked={formData.isPublic} 
              onChange={handleChange}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-full font-bold text-white transition-all ${
            loading 
            ? 'bg-brand-700 cursor-not-allowed opacity-70' 
            : 'bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40'
          }`}
        >
          {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create List')}
        </button>
      </form>
    </Modal>
  );
};

export default ListModal;
