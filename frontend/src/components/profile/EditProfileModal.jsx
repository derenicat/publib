import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EditProfileModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    avatarUrl: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || ''
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await userService.updateProfile(formData);
      
      // Global auth state'i güncellemek için checkAuth'u çağırıyoruz
      // (veya backend'den dönen user objesiyle setUser yapabiliriz, ama checkAuth daha güvenli)
      await checkAuth(); 
      
      toast.success('Profile updated successfully!');
      onSuccess(); // Parent bileşene (ProfilePage) haber ver
      onClose();
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger/10 border border-danger text-danger text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Avatar URL */}
        <div>
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-300 mb-1">
            Avatar URL
          </label>
          <input
            type="url"
            id="avatarUrl"
            name="avatarUrl"
            value={formData.avatarUrl}
            onChange={handleChange}
            placeholder="https://example.com/my-avatar.jpg"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
          <p className="text-xs text-secondary mt-1">
            Enter a direct link to an image. (Image upload coming soon!)
          </p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows="4"
            maxLength="500"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
          />
          <div className="text-right text-xs text-secondary mt-1">
            {formData.bio.length}/500
          </div>
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
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
