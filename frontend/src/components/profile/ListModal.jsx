import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import userListService from '../../services/userListService';
import { BookOpenIcon, FilmIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast'; // Import toast

const ListModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  // Edit modu mu?
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Book',
    isPublic: true,
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
        isPublic:
          initialData.isPublic !== undefined ? initialData.isPublic : true,
      });
    } else {
      // Create modu için reset
      setFormData({
        name: '',
        description: '',
        type: 'Book',
        isPublic: true,
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        // Güncelleme
        const listId =
          initialData.id || initialData.detailPageId || initialData._id;
        await userListService.updateList(listId, formData);
        toast.success('List updated successfully!');
      } else {
        // Oluşturma
        await userListService.createList(formData);
        toast.success('List created successfully!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} list.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit List' : 'Create New List'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger/10 border border-danger text-danger text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
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
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
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
            List Type{' '}
            <span className="text-secondary text-xs font-normal">
              (Cannot be changed {isEditMode ? '' : 'later'})
            </span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`
              cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all
              ${
                formData.type === 'Book'
                  ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                  : 'border-border bg-background text-secondary'
              }
              ${isEditMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
            `}
            >
              <input
                type="radio"
                name="type"
                value="Book"
                checked={formData.type === 'Book'}
                onChange={handleChange}
                disabled={isEditMode}
                className="sr-only"
              />
              <BookOpenIcon className="h-6 w-6" />
              <span className="font-bold">Book List</span>
            </label>

            <label
              className={`
              cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all
              ${
                formData.type === 'Movie'
                  ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                  : 'border-border bg-background text-secondary'
              }
              ${isEditMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
            `}
            >
              <input
                type="radio"
                name="type"
                value="Movie"
                checked={formData.type === 'Movie'}
                onChange={handleChange}
                disabled={isEditMode}
                className="sr-only"
              />
              <FilmIcon className="h-6 w-6" />
              <span className="font-bold">Movie List</span>
            </label>
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between bg-background p-4 rounded-lg border border-border">
          <div>
            <span className="text-white font-medium block">Public List</span>
            <span className="text-secondary text-xs">
              Everyone can see this list
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
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
          {loading
            ? isEditMode
              ? 'Updating...'
              : 'Creating...'
            : isEditMode
              ? 'Save Changes'
              : 'Create List'}
        </button>
      </form>
    </Modal>
  );
};

export default ListModal;
