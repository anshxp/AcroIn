import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Sparkles, LogIn, Users, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export const Navbar = ({ 
  variant = 'default',
  showAuthButtons = true,
  navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'AI Integration', href: '#ai-integration' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'About', href: '#about' },
  ]
}) => {
  useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const getDashboardPath = () => {
    if (user?.userType === 'admin') return '/admin/dashboard';
    if (user?.userType === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className={`navbar navbar--${variant}`}>
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <GraduationCap size={24} />
          </div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-title">Acro-In</span>
            <span className="navbar__logo-subtitle">Acropolis Institute</span>
          </div>
        </Link>
        <div className="navbar__badge">
          <Sparkles size={14} />
          <span>AI-Powered</span>
        </div>
        <div className="navbar__links">
          {navLinks.map((link, index) => (
            <a key={index} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </div>
        {showAuthButtons && (
          <div className="navbar__auth">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} className="navbar__auth-btn">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <button className="navbar__auth-btn" onClick={logout}>
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar__auth-btn">
                  <LogIn size={18} /> Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
