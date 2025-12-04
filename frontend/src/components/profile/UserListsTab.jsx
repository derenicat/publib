import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/solid';
import { GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import userListService from '../../services/userListService';
import ListModal from './ListModal';

const UserListsTab = ({ userId, isOwnProfile }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Listeyi yenilemek için tetikleyici

  useEffect(() => {
    const fetchLists = async () => {
      try {
        let response;
        if (isOwnProfile) {
          response = await userListService.getMyLists();
        } else {
          // Başkasının profili ise userId parametresi zorunlu
          if (userId) {
            response = await userListService.getUserLists(userId);
          }
        }

        if (response && response.data && response.data.lists) {
          setLists(response.data.lists);
        }
      } catch (err) {
        console.error("Listeler yüklenirken hata:", err);
        setError("Listeler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, [userId, isOwnProfile, refreshTrigger]);

  const handleListCreated = () => {
    setRefreshTrigger(prev => prev + 1); // Listeyi yeniden çek
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-danger">{error}</div>;
  }

  return (
    <div>
      {/* Header Area: Create Button (Only for owner) */}
      {isOwnProfile && (
        <div className="mb-6 flex justify-end">
          <button 
            onClick={() => setIsListModalOpen(true)}
            className="flex items-center gap-2 bg-surface-accent hover:bg-border text-white px-4 py-2 rounded-full text-sm font-medium transition-colors border border-border"
          >
            <PlusIcon className="h-5 w-5 text-brand-500" />
            Create New List
          </button>
        </div>
      )}

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border border-dashed">
           <h3 className="text-lg font-medium text-white mb-2">No lists yet</h3>
           <p className="text-secondary max-w-md mx-auto">
             {isOwnProfile 
               ? "You haven't created any lists yet. Create one to start organizing your favorite books and movies!" 
               : "This user hasn't created any public lists yet."}
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {lists.map((list) => (
            <Link // Kartı Link ile sardık
              to={`/list/${list.id}`} // Liste detay sayfasına yönlendir
              key={list.id}              className="group bg-surface p-6 rounded-2xl border border-border hover:border-brand-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-brand-900/10 block"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors truncate pr-4">
                    {list.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                     {/* Type Badge */}
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                        list.type === 'Book' 
                        ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' 
                        : 'border-red-500/30 text-red-400 bg-red-500/10'
                    }`}>
                        {list.type}
                    </span>
                    
                    {/* Privacy Badge (Only for owner) */}
                    {isOwnProfile && (
                        <span className="text-xs text-secondary flex items-center gap-1">
                            {list.isPublic ? (
                                <GlobeAltIcon className="h-3 w-3" />
                            ) : (
                                <LockClosedIcon className="h-3 w-3" />
                            )}
                            {list.isPublic ? 'Public' : 'Private'}
                        </span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-secondary text-sm mb-6 line-clamp-2 min-h-[2.5em]">
                {list.description || "No description provided."}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                 <span className="text-xs font-medium text-gray-400">
                    {list.entries ? list.entries.length : 0} items
                 </span>
                 <span className="text-brand-500 text-xs font-bold group-hover:translate-x-1 transition-transform flex items-center">
                    View List &rarr;
                 </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* List Modal (Create Mode) */}
      {isOwnProfile && (
        <ListModal 
          isOpen={isListModalOpen} 
          onClose={() => setIsListModalOpen(false)} 
          onSuccess={handleListCreated}
        />
      )}
    </div>
  );
};

export default UserListsTab;
