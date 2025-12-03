import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from './EditProfileModal'; // Import EditProfileModal
import { PencilIcon } from '@heroicons/react/24/outline'; // Import PencilIcon

const ProfileHeader = ({ user, isOwnProfile }) => {
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal state
  const { user: currentUser } = useAuth();

  // Kullanıcı değiştiğinde istatistikleri çek
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Eğer user objesi hazır değilse bekle
        if (!user?._id && !user?.id) return;
        const userId = user.id || user._id;
        
        const response = await userService.getFollowStats(userId);
        if (response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Stats fetching error:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  // Profil güncellendiğinde sayfayı yenile (basit çözüm)
  // Daha gelişmiş çözüm: Parent'tan (ProfilePage) bir refresh fonksiyonu almak.
  const handleProfileUpdateSuccess = () => {
      // window.location.reload(); // Flinch'e sebep olduğu için kaldırıldı. checkAuth context'i güncelliyor.
  };

  // Tarih formatlama
  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
    : 'Unknown';

  // Avatar Placeholder (İsim baş harfleri)
  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        
        {/* Avatar Area */}
        <div className="flex-shrink-0">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.username} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-surface-accent"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-surface-accent shadow-inner">
              {getInitials(user?.username)}
            </div>
          )}
        </div>

        {/* User Info Area */}
        <div className="flex-grow space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{user?.username}</h1>
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
                <button className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-brand-900/20">
                  Follow
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-300 text-base max-w-2xl leading-relaxed">
            {user?.bio || "This user hasn't written a bio yet. Mystery is their middle name."}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 cursor-pointer group">
              <span className="text-white font-bold text-lg group-hover:text-brand-400 transition-colors">
                {loadingStats ? '-' : stats.followersCount}
              </span>
              <span className="text-secondary text-sm group-hover:text-gray-300 transition-colors">Followers</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer group">
              <span className="text-white font-bold text-lg group-hover:text-brand-400 transition-colors">
                {loadingStats ? '-' : stats.followingCount}
              </span>
              <span className="text-secondary text-sm group-hover:text-gray-300 transition-colors">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={handleProfileUpdateSuccess}
      />
    </div>
  );
};

export default ProfileHeader;
