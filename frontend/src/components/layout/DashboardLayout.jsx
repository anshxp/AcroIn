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

export const DashboardLayout = () => {
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
    setShowCreatePost(false);
  };

  // Define navigation items based on user type
  // ...existing code...

  return (
    <div className="dashboard-layout">
      {/* Sidebar, Header, Main Content, etc. */}
      {/* ...existing code... */}
      <Outlet />
      {canPost && (
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};
