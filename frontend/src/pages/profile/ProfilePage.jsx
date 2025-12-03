import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import activityService from '../../services/activityService';
import reviewService from '../../services/reviewService';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import UserListsTab from '../../components/profile/UserListsTab';
import ActivityCard from '../../components/feed/ActivityCard';
import ReviewCard from '../../components/media/ReviewCard';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');
  
  // Tab Data States
  const [activities, setActivities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingTabData, setLoadingTabData] = useState(false);
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch Profile User
  useEffect(() => {
    const fetchProfileUser = async () => {
      setLoading(true);
      try {
        if (id) {
          // ID varsa o kullanıcıyı çek
          const response = await userService.getUserById(id);
          if (response.data && response.data.user) {
            setProfileUser(response.data.user);
          }
        } else {
          // ID yoksa (kendi profilim)
          setProfileUser(currentUser);
        }
      } catch (err) {
        console.error("Kullanıcı yüklenemedi:", err);
        toast.error("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfileUser();
    }
  }, [id, currentUser, authLoading]);

  // Reset pagination when tab or user changes
  useEffect(() => {
      setPage(1);
      setActivities([]);
      setReviews([]);
      setHasMore(true);
  }, [activeTab, profileUser]);

  // Fetch Tab Data
  useEffect(() => {
    if (!profileUser) return;

    const fetchTabData = async () => {
      // İlk sayfa yükleniyorsa loading göster, sonraki sayfalarda gösterme (load more butonu loading olacak)
      if (page === 1) setLoadingTabData(true);
      
      try {
        const userId = profileUser.id || profileUser._id;
        const limit = 10;

        if (activeTab === 'activity') {
          const response = await activityService.getUserFeed(userId, { page, limit });
          if (response.data && response.data.feed) {
            const newItems = response.data.feed;
            setActivities(prev => page === 1 ? newItems : [...prev, ...newItems]);
            setHasMore(newItems.length === limit);
          } else {
            setHasMore(false);
          }
        } else if (activeTab === 'reviews') {
          const response = await reviewService.getUserReviews(userId, { page, limit });
          console.log('[DEBUG] Reviews API Response:', response); // DEBUG LOG
          if (response.data && response.data.reviews) {
            const newItems = response.data.reviews;
            setReviews(prev => page === 1 ? newItems : [...prev, ...newItems]);
            setHasMore(newItems.length === limit);
          } else {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error("Tab data yüklenemedi:", err);
      } finally {
        setLoadingTabData(false);
      }
    };

    fetchTabData();
  }, [activeTab, profileUser, page]);

  // handleLoadMore fonksiyonu
  const handleLoadMore = () => {
      setPage(prev => prev + 1);
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!profileUser) {
    return <div className="text-center text-white mt-20 text-xl">User not found.</div>;
  }

  // Kendi profilimiz mi?
  const isOwnProfile = currentUser && (currentUser.id === profileUser.id || currentUser._id === profileUser._id);

  // Tab Content Render Logic
  const renderTabContent = () => {
    if (loadingTabData && page === 1) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'activity':
        return (
          <div className="space-y-6">
            {activities.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
                <p className="text-secondary">No recent activity.</p>
              </div>
            ) : (
              <>
                {activities.map(activity => (
                    <ActivityCard key={activity.id || activity._id} activity={activity} />
                ))}
                {hasMore && (
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-surface hover:bg-surface-accent border border-border text-white px-6 py-2 rounded-full transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}
              </>
            )}
          </div>
        );
      case 'lists':
        return (
          <UserListsTab 
            userId={profileUser.id || profileUser._id} 
            isOwnProfile={isOwnProfile} 
          />
        );
      case 'reviews':
        return (
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
                <p className="text-secondary">No reviews yet.</p>
              </div>
            ) : (
              <>
                {reviews.map(review => (
                    <ReviewCard 
                    key={review.id || review._id} 
                    review={review} 
                    onEdit={() => {}} 
                    onDelete={() => {}}
                    showMediaInfo={true} 
                    />
                ))}
                {hasMore && (
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-surface hover:bg-surface-accent border border-border text-white px-6 py-2 rounded-full transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <ProfileHeader user={profileUser} isOwnProfile={isOwnProfile} />
      
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;