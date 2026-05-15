import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Check for dev mode bypass
  const isDevMode = localStorage.getItem('forgeos_dev_auth') === 'true';
  
  if (isDevMode) {
    return <>{children}</>;
  }
  
  // If not authenticated and not in dev mode, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
