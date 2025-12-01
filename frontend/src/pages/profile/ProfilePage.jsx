import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import UserListsTab from '../../components/profile/UserListsTab';

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('activity');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-white mt-10">User not found.</div>;
  }

  // Tab Content Render Logic
  const renderTabContent = () => {
    switch (activeTab) {
      case 'activity':
        return (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
            <p className="text-secondary">Activity feed coming soon...</p>
          </div>
        );
      case 'lists':
        return (
          <UserListsTab 
            userId={user.id || user._id} 
            isOwnProfile={true} 
          />
        );
      case 'reviews':
        return (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
            <p className="text-secondary">User reviews coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <ProfileHeader user={user} isOwnProfile={true} />
      
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
