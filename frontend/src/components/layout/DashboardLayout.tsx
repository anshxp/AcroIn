import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
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
import '../../styles/dashboard.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeType?: 'default' | 'new';
}

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
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

  // Define navigation items based on user type
  const getNavItems = (): NavItem[] => {
    const userType = user?.userType || 'student';
    
    if (userType === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/home', label: 'Home Feed', icon: <Home size={20} /> },
        { path: '/admin/students', label: 'Manage Students', icon: <Users size={20} /> },
        { path: '/admin/faculty', label: 'Manage Faculty', icon: <GraduationCap size={20} /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
        { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
      ];
    }
    
    if (userType === 'faculty') {
      return [
        { path: '/faculty/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/home', label: 'Home Feed', icon: <Home size={20} /> },
        { path: '/faculty/search', label: 'Smart Search', icon: <Search size={20} /> },
        { path: '/faculty/verification', label: 'Facial Recognition', icon: <Camera size={20} />, badge: 'New', badgeType: 'new' },
        { path: '/faculty/recommendations', label: 'Recommendations', icon: <Star size={20} />, badge: 5 },
        { path: '/faculty/placement', label: 'Placement Hub', icon: <Briefcase size={20} /> },
        { path: '/faculty/analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
      ];
    }
    
    // Student navigation
    return [
      { path: '/home', label: 'Home', icon: <Home size={20} /> },
      { path: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/student/profile', label: 'Profile', icon: <Users size={20} /> },
      { path: '/student/skills', label: 'Skills', icon: <Award size={20} /> },
      { path: '/student/projects', label: 'Projects', icon: <FolderOpen size={20} /> },
      { path: '/student/competitions', label: 'Competitions', icon: <Trophy size={20} /> },
      { path: '/student/certificates', label: 'Certificates', icon: <FileCheck size={20} /> },
      { path: '/student/internships', label: 'Internships', icon: <Briefcase size={20} /> },
    ];
  };

  const navItems = getNavItems();

  // Get sidebar stats based on user type
  const getSidebarStats = () => {
    if (user?.userType === 'faculty' || user?.userType === 'admin') {
      return [
        { label: 'Active Students', value: '247', color: 'default' },
        { label: 'Verified Profiles', value: '234', color: 'blue' },
        { label: 'Pending Reviews', value: '13', color: 'orange' },
      ];
    }
    return [
      { label: 'Profile Score', value: '85%', color: 'blue' },
      { label: 'Skills Verified', value: '12', color: 'default' },
      { label: 'Connections', value: '48', color: 'default' },
    ];
  };

  const stats = getSidebarStats();

  const getUserDisplayName = () => {
    if (user?.userType === 'faculty') {
      return `Dr. ${user?.firstname || 'User'} ${user?.lastName || ''}`;
    }
    return user?.name || 'User';
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
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
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
            {stats.map((stat, index) => (
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
          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search students, skills, projects..." />
          </div>

          <div className="header-actions">
            <button className="header-icon-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            
            <div className="user-profile" onClick={() => navigate(user?.userType === 'faculty' ? '/faculty/profile' : '/student/profile')}>
              <div className="user-avatar">
                {getUserInitials()}
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
