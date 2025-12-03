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

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const studentNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/student/dashboard' },
    { icon: <User size={20} />, label: 'Profile', path: '/student/profile' },
    { icon: <FolderGit2 size={20} />, label: 'Projects', path: '/student/projects' },
    { icon: <Briefcase size={20} />, label: 'Internships', path: '/student/internships' },
    { icon: <Trophy size={20} />, label: 'Competitions', path: '/student/competitions' },
    { icon: <Award size={20} />, label: 'Certificates', path: '/student/certificates' },
  ];

  const facultyNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/faculty/dashboard' },
    { icon: <User size={20} />, label: 'Profile', path: '/faculty/profile' },
    { icon: <CheckSquare size={20} />, label: 'Verify Students', path: '/faculty/verify' },
    { icon: <Bell size={20} />, label: 'Post Opportunities', path: '/faculty/opportunities' },
  ];

  const adminNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Users size={20} />, label: 'Manage Students', path: '/admin/students' },
    { icon: <UserCog size={20} />, label: 'Manage Faculty', path: '/admin/faculty' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  const getNavItems = () => {
    if (user?.role?.includes('super_admin') || user?.role?.includes('dept_admin')) {
      return [...facultyNavItems, ...adminNavItems];
    }
    if (user?.userType === 'faculty') {
      return facultyNavItems;
    }
    return studentNavItems;
  };

  const navItems = getNavItems();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200
        transition-all duration-300 z-30
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!isCollapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AcroIn</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg
                  transition-colors duration-200
                  ${isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className={`
            flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg
            text-red-600 hover:bg-red-50 transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
