import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import UserCard from './UserCard';

const UserListModal = ({ isOpen, onClose, title, fetchUsers, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && fetchUsers) {
      const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchUsers();
          console.log('[DEBUG] UserListModal Fetched Data:', data); // DEBUG LOG

          // Backend response structure: { status: 'success', data: { followers: [...], following: [...] } }
          
          if (data.data && data.data.followers) {
              setUsers(data.data.followers);
          } else if (data.data && data.data.following) {
              setUsers(data.data.following);
          } else if (Array.isArray(data)) {
              setUsers(data);
          } else {
              setUsers([]);
          }

        } catch (err) {
          console.error("Kullanıcılar yüklenemedi:", err);
          setError("Failed to load users.");
        } finally {
          setLoading(false);
        }
      };
      loadUsers();
    } else {
        setUsers([]); // Modal kapanınca temizle
    }
  }, [isOpen, fetchUsers]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-danger">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-secondary">No users found.</div>
      ) : (
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {users.map((userObj) => {
             // Backend yapısına göre userObj -> { _id, follower: {...}, following: {...} }
             // type: 'followers' ise follower objesini al.
             // type: 'following' ise following objesini al.
             
             let user = userObj;
             if (type === 'followers' && userObj.follower) {
                 user = userObj.follower;
             } else if (type === 'following' && userObj.following) {
                 user = userObj.following;
             }
             
             // Eğer userObj direkt user ise (örneğin UserSearchPage'den geliyorsa), userObj olarak kalır.
             
             return <UserCard key={user.id || user._id || user.detailPageId} user={user} />;
          })}
        </div>
      )}
    </Modal>
  );
};

export default UserListModal;
