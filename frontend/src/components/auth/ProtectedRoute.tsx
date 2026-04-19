import React from 'react';
import { Navigate } from 'react-router-dom';
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

  // Check roles only for faculty accounts; admin accounts are allowed by user type.
  if (allowedRoles && user?.userType === 'faculty') {
    const userRoles = Array.isArray(user.role) ? user.role : [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
