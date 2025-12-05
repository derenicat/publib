import { useState } from 'react';
import Modal from '../common/Modal';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.passwordConfirm) {
        toast.error("New passwords don't match!");
        return;
    }

    setLoading(true);
    try {
      await userService.updatePassword(formData);
      toast.success('Password updated successfully!');
      onClose();
      setFormData({ currentPassword: '', newPassword: '', passwordConfirm: '' }); // Reset form
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            minLength="8"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            minLength="8"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg font-bold text-white transition-colors ${
            loading ? 'bg-brand-700 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
          }`}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;