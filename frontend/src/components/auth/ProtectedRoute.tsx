import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('student' | 'faculty' | 'admin')[];
  allowedRoles?: ('faculty' | 'dept_admin' | 'super_admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedUserTypes,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check user type
  if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType as 'student' | 'faculty' | 'admin')) {
    return <Navigate to="/" replace />;
  }

  // Check roles (for faculty)
  if (allowedRoles && user?.role) {
    const hasRole = allowedRoles.some((role) => user.role?.includes(role));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
