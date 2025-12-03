import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import UserCard from '../../components/users/UserCard'; // Henüz oluşturmadık, oluşturacağız

const UserSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get('username') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // Arama yapılıp yapılmadığını takip et

  useEffect(() => {
    if (initialSearchTerm) {
      handleSearch(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setHasSearched(true); // Arama başlatıldı
    setSearchParams({ username: term });

    try {
      const response = await userService.searchUsers(term);
      if (response.data && response.data.users) {
        setSearchResults(response.data.users);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("User search failed:", err);
      setError(err.response?.data?.message || 'Failed to search users.');
      toast.error(err.response?.data?.message || 'Failed to search users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleInputChange = (e) => {
      setSearchTerm(e.target.value);
      setHasSearched(false); // Yeni bir şey yazıldığında "bulunamadı" mesajını gizle
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Find Users</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search by username..."
          className="flex-grow bg-surface border border-border rounded-full px-5 py-2.5 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-danger bg-surface rounded-lg border border-danger">
          {error}
        </div>
      )}

      {!loading && !error && searchResults.length === 0 && hasSearched && searchTerm.trim() && (
        <div className="text-center py-8 text-secondary bg-surface rounded-lg border border-dashed border-border">
          No users found matching "{searchTerm}".
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {searchResults.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default UserSearchPage;
