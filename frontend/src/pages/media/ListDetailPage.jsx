import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import userListService from '../../services/userListService';
import { useAuth } from '../../context/AuthContext';
import ListModal from '../../components/profile/ListModal';

const ListDetailPage = () => {
  const { id } = useParams(); // URL'den liste ID'sini al
  const { user: currentUser } = useAuth(); // Oturum açmış kullanıcı
  const navigate = useNavigate();
  
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchListDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userListService.getList(id);
        if (response.data && response.data.list) {
          setList(response.data.list);
        } else {
          setError('List not found.');
        }
      } catch (err) {
        console.error("Liste detayları yüklenirken hata:", err);
        setError(err.response?.data?.message || 'Failed to load list details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListDetails();
    }
  }, [id, refreshTrigger]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      return;
    }

    try {
      await userListService.deleteList(id);
      navigate('/profile'); // Profil sayfasına dön
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete list.');
    }
  };

  const handleListUpdated = () => {
    setRefreshTrigger(prev => prev + 1); // Listeyi yeniden çek
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-danger text-lg">{error}</div>;
  }

  if (!list) {
    return <div className="text-center py-20 text-secondary text-lg">List details could not be loaded.</div>;
  }

  // Liste sahibi miyiz?
  const isOwner = currentUser && (currentUser.id === list.user.id || currentUser._id === list.user._id);

  // Varsayılan liste mi? (My Books / My Movies)
  // Bu listeler sistem tarafından oluşturulur ve silinemez/düzenlenemez.
  const isDefaultList = list.name === 'My Books' || list.name === 'My Movies';

  return (
    <div className="max-w-4xl mx-auto">
      {/* List Header */}
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{list.name}</h1>
            <p className="text-secondary text-base mb-3">{list.description || "No description provided."}</p>
            
            <div className="flex items-center gap-3 text-sm">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                    list.type === 'Book' 
                    ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' 
                    : 'border-red-500/30 text-red-400 bg-red-500/10'
                }`}>
                    {list.type}
                </span>
                <span className="text-secondary flex items-center gap-1">
                    {list.isPublic ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    )}
                    {list.isPublic ? 'Public' : 'Private'}
                </span>
                <span className="text-secondary text-sm">
                    by <Link to={`/profile/${list.user.detailPageId || list.user.id}`} className="text-brand-400 hover:underline">
                        @{list.user.username}
                    </Link>
                </span>
            </div>
          </div>
          
          {/* Actions for Owner (Varsayılan listeler hariç) */}
          {isOwner && !isDefaultList && (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-surface-accent hover:bg-border text-white text-sm font-medium rounded-full transition-colors border border-border"
              >
                Edit List
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-danger/20 hover:bg-danger/40 text-danger text-sm font-medium rounded-full transition-colors border border-danger/50"
              >
                Delete List
              </button>
            </div>
          )}
        </div>

        {/* List Items */}
        <h2 className="text-2xl font-bold text-white mb-6">Items ({list.entries.length})</h2>
        {list.entries.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
            <p className="text-secondary">No items in this list yet.</p>
            {isOwner && (
                <button 
                  onClick={() => navigate(`/search?type=${list.type.toLowerCase()}`)}
                  className="mt-4 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-brand-900/20"
                >
                    Add Items
                </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {list.entries.map((entry) => {
              const item = entry.item;
              const type = list.type.toLowerCase();
              const id = item.id || item._id || item.googleBooksId || item.tmdbId;
              const title = item.title;
              const image = type === 'book' ? item.coverImage : `https://image.tmdb.org/t/p/w500${item.posterPath}`;
              const date = type === 'book' ? item.publishedDate : item.releaseDate;
              const subtitle = type === 'book' ? (item.authors ? item.authors[0] : 'Unknown Author') : (date ? date.split('-')[0] : '');

              return (
                <Link 
                  to={`/media/${type}/${id}`} 
                  key={entry.id} 
                  className="group block bg-surface rounded-xl border border-border overflow-hidden hover:border-brand-500/50 transition-all hover:shadow-xl hover:shadow-brand-900/20"
                >
                  <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
                    {image ? (
                      <img 
                        src={image} 
                        alt={title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary bg-surface-accent">
                        No Image
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full border border-border shadow-sm">
                      {entry.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-brand-400 transition-colors">
                      {title}
                    </h3>
                    <p className="text-secondary text-xs truncate">
                      {subtitle}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit List Modal */}
      {isOwner && (
        <ListModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleListUpdated}
          initialData={list} // Edit mode için mevcut veriyi gönder
        />
      )}
    </div>
  );
};

export default ListDetailPage;
