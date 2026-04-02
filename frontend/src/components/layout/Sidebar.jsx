import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Briefcase,
  Trophy,
  Award,
  FolderGit2,
  Users,
  UserCog,
  CheckSquare,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const studentNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/student/dashboard' },
    { icon: <User size={20} />, label: 'Profile', path: '/student/profile' },
    { icon: <FolderGit2 size={20} />, label: 'Projects', path: '/student/projects' },
    { icon: <Briefcase size={20} />, label: 'Internships', path: '/student/internships' },
    { icon: <Trophy size={20} />, label: 'Competitions', path: '/student/competitions' },
    { icon: <Award size={20} />, label: 'Certificates', path: '/student/certificates' },
  ];

  const facultyNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/faculty/dashboard' },
    { icon: <User size={20} />, label: 'Profile', path: '/faculty/profile' },
    { icon: <CheckSquare size={20} />, label: 'Verify Students', path: '/faculty/verify' },
    { icon: <Bell size={20} />, label: 'Post Opportunities', path: '/faculty/opportunities' },
  ];

  const adminNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Users size={20} />, label: 'Manage Students', path: '/admin/students' },
    { icon: <UserCog size={20} />, label: 'Manage Faculty', path: '/admin/faculty' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  const getNavItems = () => {
    if (user?.role?.includes('super_admin') || user?.role?.includes('dept_admin')) {
      return adminNavItems;
    }
    if (user?.userType === 'faculty') {
      return facultyNavItems;
    }
    return studentNavItems;
  };

  const navItems = getNavItems();

  return (
    <aside className={`sidebar${isCollapsed ? ' collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={onToggle}>
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      <nav className="sidebar-nav">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`sidebar-nav-item${location.pathname === item.path ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <button className="sidebar-logout" onClick={logout}>
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
};
