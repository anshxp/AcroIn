import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';
import { notificationAPI } from '../../services/api';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      if (!user?.id) {
        setUnreadCount(0);
        return;
      }

      try {
        const notifications = await notificationAPI.getByUser(user.id);
        setUnreadCount(notifications.filter((notification) => !notification.read).length);
      } catch {
        setUnreadCount(0);
      }
    };

    loadUnreadNotifications();
  }, [user?.id]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const query = searchTerm.trim();
    if (!query) return;

    if (user?.userType === 'student') {
      navigate(`/student/search?query=${encodeURIComponent(query)}`);
      return;
    }

    navigate(`/faculty/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Search */}
        <form className="hidden md:flex items-center" onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={user?.userType === 'student' ? 'Smart search students...' : 'Search students...'}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       text-sm"
            />
          </div>
        </form>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={() => navigate('/notifications')}
          type="button"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>

        {/* User */}
        <div className="flex items-center space-x-3">
          <Avatar name={user?.name || 'User'} size="md" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.userType}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
