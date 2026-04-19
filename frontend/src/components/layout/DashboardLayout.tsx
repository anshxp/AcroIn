import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Camera, 
  Star, 
  Briefcase, 
  TrendingUp, 
  Users, 
  ChevronLeft,
  Bell,
  Settings,
  Home,
  GraduationCap,
  FolderOpen,
  Trophy,
  Award,
  FileCheck,
  LogOut,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CreatePostModal } from '../posts';
import { facultyAPI, notificationAPI, studentAPI, uiAPI } from '../../services/api';
import '../../styles/dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeType?: 'default' | 'new';
}

interface SidebarStat {
  label: string;
  value: string;
  color: 'default' | 'blue' | 'orange';
}

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState<string | null>(null);
  const [sidebarStats, setSidebarStats] = useState<SidebarStat[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const canPost = user?.userType === 'faculty' || user?.userType === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePostCreated = () => {
    // Optionally refresh the feed or show a toast
    setShowCreatePost(false);
  };

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

  useEffect(() => {
    const resolveImageUrl = (url?: string | null) => {
      if (!url) return null;
      if (/^https?:\/\//i.test(url)) return url;
      return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
    };

    const loadHeaderAvatar = async () => {
      if (!user?.id) {
        setHeaderAvatarUrl(null);
        return;
      }

      try {
        if (user.userType === 'student') {
          const identifier = user.email || user.id;
          const profile = await studentAPI.getProfile(identifier);
          setHeaderAvatarUrl(resolveImageUrl(profile.profile_image || null));
          return;
        }

        if (user.userType === 'faculty') {
          const profile = await facultyAPI.getProfile();
          const avatar = (profile as any)?.profilepic || (profile as any)?.profile_image || null;
          setHeaderAvatarUrl(resolveImageUrl(avatar));
          return;
        }

        setHeaderAvatarUrl(null);
      } catch {
        setHeaderAvatarUrl(null);
      }
    };

    loadHeaderAvatar();
  }, [user?.id, user?.email, user?.userType]);

  useEffect(() => {
    const loadSidebarStats = async () => {
      if (!user?.id) {
        setSidebarStats([]);
        return;
      }

      try {
        if (user.userType === 'faculty' || user.userType === 'admin') {
          const analytics = await uiAPI.getFacultyAnalytics();
          const totalStudents = Number(analytics?.stats?.totalProfiles || 0);
          const verifiedProfiles = Number(analytics?.stats?.verifiedUsers || 0);
          const pendingReviews = Math.max(totalStudents - verifiedProfiles, 0);

          setSidebarStats([
            { label: 'Active Students', value: String(totalStudents), color: 'default' },
            { label: 'Verified Profiles', value: String(verifiedProfiles), color: 'blue' },
            { label: 'Pending Reviews', value: String(pendingReviews), color: 'orange' },
          ]);
          return;
        }

        const identifier = user.email || user.id;
        const profile = await studentAPI.getProfile(identifier);
        const skillsVerified = Array.isArray(profile?.skills)
          ? profile.skills.filter((skill) => Boolean(skill?.verified)).length
          : 0;

        setSidebarStats([
          { label: 'Skills Verified', value: String(skillsVerified), color: 'default' },
        ]);
      } catch {
        if (user.userType === 'faculty' || user.userType === 'admin') {
          setSidebarStats([
            { label: 'Active Students', value: '0', color: 'default' },
            { label: 'Verified Profiles', value: '0', color: 'blue' },
            { label: 'Pending Reviews', value: '0', color: 'orange' },
          ]);
          return;
        }

        setSidebarStats([
          { label: 'Skills Verified', value: '0', color: 'default' },
        ]);
      }
    };

    loadSidebarStats();
  }, [user?.id, user?.email, user?.userType]);

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

  // Define navigation items based on user type
  const getNavItems = (): NavItem[] => {
    const userType = user?.userType || 'student';
    const userRoles = Array.isArray(user?.role) ? user.role : [];
    const hasAdminManagementAccess = userRoles.includes('dept_admin') || userRoles.includes('super_admin');
    
    if (userType === 'admin') {
      return [
        { path: '/home', label: 'Home Feed', icon: <Home size={20} /> },
        { path: '/admin/students', label: 'Manage Students', icon: <Users size={20} /> },
        { path: '/admin/faculty', label: 'Manage Faculty', icon: <GraduationCap size={20} /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
        { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
      ];
    }
    
    if (userType === 'faculty') {
      const facultyItems: NavItem[] = [
        { path: '/home', label: 'Home Feed', icon: <Home size={20} /> },
        { path: '/faculty/search', label: 'Smart Search', icon: <Search size={20} /> },
        { path: '/faculty/verification', label: 'Facial Recognition', icon: <Camera size={20} />, badge: 'New', badgeType: 'new' },
        { path: '/faculty/recommendations', label: 'Recommendations', icon: <Star size={20} />, badge: 5 },
        { path: '/faculty/placement', label: 'Placement Hub', icon: <Briefcase size={20} /> },
        { path: '/faculty/analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
      ];

      if (hasAdminManagementAccess) {
        facultyItems.push(
          { path: '/admin/students', label: 'Manage Students', icon: <Users size={20} /> },
          { path: '/admin/faculty', label: 'Manage Faculty', icon: <GraduationCap size={20} /> },
          { path: '/admin/analytics', label: 'Admin Analytics', icon: <TrendingUp size={20} /> },
          { path: '/admin/settings', label: 'Admin Settings', icon: <Settings size={20} /> }
        );
      }

      return facultyItems;
    }
    
    // Student navigation
    return [
      { path: '/home', label: 'Home', icon: <Home size={20} /> },
      { path: '/student/search', label: 'Smart Search', icon: <Search size={20} /> },
      { path: '/student/profile', label: 'Profile', icon: <Users size={20} /> },
      { path: '/student/skills', label: 'Skills', icon: <Award size={20} /> },
      { path: '/student/projects', label: 'Projects', icon: <FolderOpen size={20} /> },
      { path: '/student/competitions', label: 'Competitions', icon: <Trophy size={20} /> },
      { path: '/student/certificates', label: 'Certificates', icon: <FileCheck size={20} /> },
      { path: '/student/internships', label: 'Internships', icon: <Briefcase size={20} /> },
    ];
  };

  const navItems = getNavItems();

  const getUserDisplayName = () => {
    if (user?.name && user.name.trim()) {
      return user.name.trim();
    }

    if (user?.firstname || user?.lastName) {
      return `${user?.firstname || ''} ${user?.lastName || ''}`.trim() || 'User';
    }

    return user?.userType === 'faculty' ? 'Faculty' : 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">AI</div>
            <span className="sidebar-logo-text">Acro-In</span>
          </NavLink>
          <button 
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span className="nav-item-text">{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.badgeType === 'new' ? 'new' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-stats">
            {sidebarStats.map((stat, index) => (
              <div key={index} className="sidebar-stat">
                <span className="sidebar-stat-label">{stat.label}</span>
                <span className={`sidebar-stat-value ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <Search size={20} />
            <input
              type="text"
              placeholder={user?.userType === 'student' ? 'Smart search students, skills, certifications...' : 'Search students, skills, projects...'}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </form>

          <div className="header-actions">
            <button className="header-icon-btn" onClick={() => navigate('/notifications')} type="button" title="Notifications">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            
            <div className="user-profile" onClick={() => navigate(user?.userType === 'faculty' ? '/faculty/profile' : '/student/profile')}>
              <div className="user-avatar">
                {headerAvatarUrl ? (
                  <img
                    src={headerAvatarUrl}
                    alt="User profile"
                    className="user-avatar-image"
                  />
                ) : (
                  getUserInitials()
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{getUserDisplayName()}</span>
                <span className="user-role">{user?.userType === 'faculty' ? 'Faculty' : user?.userType === 'admin' ? 'Admin' : 'Student'}</span>
              </div>
            </div>

            <button 
              className="header-icon-btn logout-btn" 
              onClick={handleLogout}
              title="Logout"
              style={{ marginLeft: '8px', color: '#ef4444' }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* Floating Post Button - Only for Faculty and Admin */}
        {canPost && (
          <button 
            className="floating-post-btn"
            onClick={() => setShowCreatePost(true)}
            title="Create a post"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};
