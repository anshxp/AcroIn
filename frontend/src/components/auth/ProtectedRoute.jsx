import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../ui';

export const ProtectedRoute = ({
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
  if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
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
