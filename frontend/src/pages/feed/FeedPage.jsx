import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import activityService from '../../services/activityService';
import { useAuth } from '../../context/AuthContext';
import ActivityCard from '../../components/feed/ActivityCard';
import toast from 'react-hot-toast';

const FeedPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFeedType = searchParams.get('type') || 'global'; // 'global', 'personal', 'social'
  const initialPage = parseInt(searchParams.get('page')) || 1;

  const [activeFeedType, setActiveFeedType] = useState(initialFeedType);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      const params = { page, limit: 10 }; // Sayfalama için limit

      if (activeFeedType === 'global') {
        response = await activityService.getGlobalFeed(params);
      } else if (activeFeedType === 'personal' && user) {
        response = await activityService.getPersonalFeed(params);
      } else if (activeFeedType === 'social' && user) {
        response = await activityService.getSocialFeed(params);
      } else {
        // Kullanıcı giriş yapmamışsa ve kişisel/sosyal feed istiyorsa global'e dön
        if (!user) {
            setActiveFeedType('global');
            setSearchParams({ type: 'global', page: 1 });
            response = await activityService.getGlobalFeed(params);
        } else {
            // Hiçbir feed tipi uymuyorsa veya user yoksa, hata döndür
            throw new Error('Invalid feed type or user not authenticated for this feed.');
        }
      }

      if (response.data && response.data.feed) {
        setActivities(prevActivities => {
            // Eğer yeni bir sayfa yükleniyorsa, mevcut aktivitelere ekle
            if (page > 1) {
                return [...prevActivities, ...response.data.feed];
            } else {
                // İlk sayfa veya feed tipi değiştiyse yeni listeyi başlat
                return response.data.feed;
            }
        });
        setHasMore(response.data.feed.length === params.limit); // Daha fazla aktivite var mı?
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Aktiviteler çekilemedi:", err);
      setError(err.response?.data?.message || 'Failed to load activities.');
      toast.error(err.response?.data?.message || 'Failed to load activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // URL parametrelerini güncelle ve fetchActivities'i tetikle
    const params = { type: activeFeedType, page };
    setSearchParams(params);

    // İlk sayfa veya feed tipi değiştiğinde mevcut aktiviteleri temizle
    if (page === 1) {
        setActivities([]); // Aktiviteleri temizle ki sıfırdan başlasın
    }
    fetchActivities();
  }, [activeFeedType, page, user]); // user değiştiğinde de tetiklenmeli

  // Feed tipi değiştiğinde sayfayı sıfırla
  const handleFeedTypeChange = (type) => {
    setActiveFeedType(type);
    setPage(1); // Feed tipi değişince sayfayı sıfırla
  };

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Aktivite güncellendiğinde tüm feed'i yeniden çek (beğeni, yorum sonrası)
  const handleActivityUpdate = () => {
    setPage(1); // Sayfayı sıfırlayıp feed'i baştan çek
    setActivities([]); // Önceki aktiviteleri temizle
    fetchActivities();
  };


  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
        <h1 className="text-3xl font-bold text-white">
          {activeFeedType === 'global' ? 'Global Feed' : 
           activeFeedType === 'personal' ? 'My Activity' : 
           'Social Feed'}
        </h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleFeedTypeChange('global')} 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFeedType === 'global' ? 'bg-brand-600 text-white' : 'bg-surface-accent text-gray-300 hover:bg-surface-accent/70'}`}
          >
            Global
          </button>
          <button 
            onClick={() => handleFeedTypeChange('personal')}
            disabled={!user}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFeedType === 'personal' ? 'bg-brand-600 text-white' : 'bg-surface-accent text-gray-300 hover:bg-surface-accent/70'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            My Activity
          </button>
          <button 
            onClick={() => handleFeedTypeChange('social')} 
            disabled={!user}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFeedType === 'social' ? 'bg-brand-600 text-white' : 'bg-surface-accent text-gray-300 hover:bg-surface-accent/70'} ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Social
          </button>
        </div>
      </div>

      {error && (
        <div className="text-center py-12 text-danger bg-surface rounded-2xl border border-border">
          {error}
        </div>
      )}

      {activities.length === 0 && !loading && !error ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
          <p className="text-secondary text-lg">No activities to display.</p>
          <p className="text-secondary text-sm mt-2">
            {activeFeedType === 'global' ? 'Start adding content or following users to see activities.' : 
             activeFeedType === 'personal' ? 'You haven\'t performed any actions yet.' : 
             'Follow more users to see their activities here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map(activity => (
            <ActivityCard key={activity.id || activity._id} activity={activity} onActivityUpdate={handleActivityUpdate} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-full font-bold transition-colors shadow-lg shadow-brand-900/20 disabled:opacity-70"
          >
            {loading ? 'Loading more...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
