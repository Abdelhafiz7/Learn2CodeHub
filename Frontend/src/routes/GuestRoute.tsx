import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { LoadingSpinner } from '@/components/ui';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading..." />;
  }

  if (isAuthenticated && user) {
    switch (user.role) {
      case 'Admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'Instructor':
        return <Navigate to="/instructor/dashboard" replace />;
      default:
        return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <>{children}</>;
};