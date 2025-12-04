import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from './EditProfileModal'; // Import EditProfileModal
import UserListModal from '../users/UserListModal'; // Import UserListModal
import { PencilIcon } from '@heroicons/react/24/outline'; // Import PencilIcon
import { useNavigate } from 'react-router-dom'; // useNavigate eklendi
import toast from 'react-hot-toast'; // toast eklendi
import { getInitials, formatDate } from '../../utils/helpers';

const ProfileHeader = ({ user, isOwnProfile }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal state
  const [userListModal, setUserListModal] = useState({
    isOpen: false,
    type: null,
    title: '',
  }); // User List Modal state
  const { user: currentUser, setUser } = useAuth();
  const navigate = useNavigate();

  // Follow State (Optimistic UI için)
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false);
  const [followerCount, setFollowerCount] = useState(user?.followersCount || 0);

  // Değerleri primitive olarak alıp effect'e veriyoruz ki referans sorunları (cascading render) olmasın.
  const userId = user?.id;
  const isFollowingProp = user?.isFollowing;
  const followersCountProp = user?.followersCount;

  // user prop'u değişince state'i güncelle
  useEffect(() => {
    if (userId) {
      setIsFollowing(!!isFollowingProp);
      setFollowerCount(followersCountProp || 0);
    }
  }, [userId, isFollowingProp, followersCountProp]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Optimistic Update (Local Profile)
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);
    setFollowerCount((prev) => (newIsFollowing ? prev + 1 : prev - 1));

    // Optimistic Update (Global Auth User - My Profile)
    // Eğer kendi profilimizde değilsek, kendi "Following" sayımızı güncellemeliyiz.
    if (!isOwnProfile && setUser) {
      setUser((prev) => ({
        ...prev,
        followingCount: newIsFollowing
          ? (prev.followingCount || 0) + 1
          : (prev.followingCount || 0) - 1,
      }));
    }

    try {
      const userId = user.id || user._id;
      if (newIsFollowing) {
        await userService.followUser(userId);
        toast.success(`You are now following ${user.username}`);
      } else {
        await userService.unfollowUser(userId);
        toast.success(`Unfollowed ${user.username}`);
      }
    } catch (error) {
      // Revert on error (Local Profile)
      setIsFollowing(!newIsFollowing);
      setFollowerCount((prev) => (!newIsFollowing ? prev + 1 : prev - 1));

      // Revert on error (Global Auth User)
      if (!isOwnProfile && setUser) {
        setUser((prev) => ({
          ...prev,
          followingCount: !newIsFollowing
            ? (prev.followingCount || 0) + 1
            : (prev.followingCount || 0) - 1,
        }));
      }

      toast.error(
        error.response?.data?.message || 'Failed to update follow status.'
      );
    }
  };

  // Profil güncellendiğinde sayfayı yenile (basit çözüm)
  // Daha gelişmiş çözüm: Parent'tan (ProfilePage) bir refresh fonksiyonu almak.
  const handleProfileUpdateSuccess = () => {
    // window.location.reload(); // Flinch'e sebep olduğu için kaldırıldı. checkAuth context'i güncelliyor.
  };

  const openUserListModal = (type) => {
    const title = type === 'followers' ? 'Followers' : 'Following';
    setUserListModal({ isOpen: true, type, title });
  };

  // Tarih formatlama
  const joinDate = user?.createdAt ? formatDate(user.createdAt) : 'Unknown';

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar Area */}
                <div className="shrink-0">
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-surface-accent"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-linear-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-surface-accent shadow-inner">
                      {getInitials(user?.username)}
                    </div>
                  )}
                </div>
        {/* User Info Area */}
        <div className="flex-grow space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {user?.username}
              </h1>
              <p className="text-secondary text-sm">Joined {joinDate}</p>
            </div>

            {/* Action Buttons */}
            <div>
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface-accent hover:bg-border text-white text-sm font-medium rounded-full transition-colors border border-border"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-colors shadow-lg ${
                    isFollowing
                      ? 'bg-surface-accent hover:bg-red-500/20 hover:text-red-500 text-white border border-border'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-900/20'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-300 text-base max-w-2xl leading-relaxed">
            {user?.bio ||
              "This user hasn't written a bio yet. Mystery is their middle name."}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-2">
            <button
              onClick={() => openUserListModal('followers')}
              className="flex items-center gap-1 cursor-pointer group focus:outline-none"
            >
              <span className="text-white font-bold text-lg group-hover:text-brand-400 transition-colors">
                {followerCount} Followers
              </span>
            </button>
            <button
              onClick={() => openUserListModal('following')}
              className="flex items-center gap-1 cursor-pointer group focus:outline-none"
            >
              <span className="text-white font-bold text-lg group-hover:text-brand-400 transition-colors">
                {user?.followingCount || 0} Following
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleProfileUpdateSuccess}
      />

      {/* User List Modal (Followers/Following) */}
      <UserListModal
        isOpen={userListModal.isOpen}
        onClose={() => setUserListModal({ ...userListModal, isOpen: false })}
        title={userListModal.title}
        type={userListModal.type} // type prop'u eklendi
        fetchUsers={() => {
          const userId = user.id || user._id;
          if (userListModal.type === 'followers')
            return userService.getFollowers(userId);
          if (userListModal.type === 'following')
            return userService.getFollowing(userId);
          return Promise.resolve([]);
        }}
      />
    </div>
  );
};

export default ProfileHeader;
