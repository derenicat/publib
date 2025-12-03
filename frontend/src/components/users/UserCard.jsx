import { Link } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/solid'; // Solid ikon

const UserCard = ({ user }) => {
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="bg-surface p-4 rounded-xl border border-border flex items-center justify-between shadow-sm">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-lg font-bold">
            {getInitials(user.username)}
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-lg hover:text-brand-400 transition-colors">
            @{user.username}
          </p>
          {user.bio && <p className="text-secondary text-sm line-clamp-1">{user.bio}</p>}
        </div>
      </Link>
      {/* Follow/Unfollow butonu buraya eklenecek, şimdilik sadece card */}
    </div>
  );
};

export default UserCard;
