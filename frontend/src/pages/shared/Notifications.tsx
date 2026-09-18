import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Filter, Mail, Eye, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import type { NotificationItem } from '../../types';

type FilterMode = 'all' | 'unread' | 'read';

const notificationMeta: Record<NotificationItem['type'], { label: string; icon: React.ReactNode }> = {
  alert: { label: 'Alert', icon: <ShieldAlert size={16} /> },
  message: { label: 'Message', icon: <Mail size={16} /> },
  profile_view: { label: 'Profile View', icon: <Eye size={16} /> },
  system: { label: 'System', icon: <Bell size={16} /> },
  certificate: { label: 'Certificate', icon: <Award size={16} /> },
};

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all');
  const [activeType, setActiveType] = useState<'all' | NotificationItem['type']>('all');
  const authUserId = user?.authUserId || user?.id || '';

  useEffect(() => {
    const loadNotifications = async () => {
      if (!authUserId) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        setNotifications(await notificationAPI.getByUser(authUserId));
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [authUserId]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);
  const filteredNotifications = useMemo(() => notifications.filter((item) => {
    const matchesReadState = activeFilter === 'all' || (activeFilter === 'unread' && !item.read) || (activeFilter === 'read' && item.read);
    const matchesType = activeType === 'all' || item.type === activeType;
    return matchesReadState && matchesType;
  }), [activeFilter, activeType, notifications]);

  const markRead = async (notificationId: string) => {
    try {
      const updated = await notificationAPI.markAsRead(notificationId);
      setNotifications((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch {
      // Keep the current notification state when the API update fails.
    }
  };

  const getNotificationPath = (notification: NotificationItem) => {
    if (notification.actionPath) return notification.actionPath;
    if (notification.sourceType === 'post' && notification.sourceId) return `/home?post=${notification.sourceId}`;
    return '/home';
  };

  const handleOpenNotification = async (notification: NotificationItem) => {
    if (!notification.read) await markRead(notification._id);
    navigate(getNotificationPath(notification));
  };

  const markAllRead = async () => {
    await Promise.all(notifications.filter((item) => !item.read).map((item) => notificationAPI.markAsRead(item._id)));
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div className="page-title-section"><h1>Notifications</h1><p>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</p></div>
        {unreadCount > 0 && <button className="create-post-btn" onClick={markAllRead} type="button"><CheckCheck size={18} />Mark all read</button>}
      </div>
      <div className="card" style={{ marginBottom: '24px' }}><div className="card-body"><div className="filters-row">
        <div className="filter-group"><span className="filter-label"><Filter size={16} /> Status:</span>{(['all', 'unread', 'read'] as const).map((mode) => <button key={mode} className={`filter-chip ${activeFilter === mode ? 'active' : ''}`} onClick={() => setActiveFilter(mode)} type="button">{mode === 'all' ? 'All' : mode === 'unread' ? 'Unread' : 'Read'}</button>)}</div>
        <div className="filter-group"><span className="filter-label">Type:</span>{(['all', 'alert', 'message', 'profile_view', 'system', 'certificate'] as const).map((type) => <button key={type} className={`filter-chip ${activeType === type ? 'active' : ''}`} onClick={() => setActiveType(type)} type="button">{type === 'all' ? 'All Types' : notificationMeta[type].label}</button>)}</div>
      </div></div></div>
      {loading && <p className="page-subtitle">Loading notifications...</p>}
      {!loading && filteredNotifications.length === 0 && <p className="page-subtitle">No notifications matched your filters.</p>}
      <div className="student-list">{filteredNotifications.map((notification) => {
        const meta = notificationMeta[notification.type];
        return <div key={notification._id} className="notification-card">
          <div className={`notification-avatar ${notification.read ? 'read' : 'unread'}`}>{notification.read ? <CheckCheck size={18} /> : <Bell size={18} />}</div>
          <div className="notification-content"><div className="notification-title-row"><h3 className="notification-title">{meta.label}</h3>{!notification.read && <span className="notification-new">New</span>}</div><div className="notification-message">{notification.message}</div><div className="notification-time">{meta.icon}<span>{new Date(notification.createdAt).toLocaleString()}</span></div></div>
          <div className="notification-actions"><button className="notification-action-btn" onClick={() => handleOpenNotification(notification)} type="button">Open</button>{!notification.read && <button className="notification-action-btn" onClick={() => markRead(notification._id)} type="button">Mark read</button>}</div>
        </div>;
      })}</div>
    </div>
  );
};
