import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLoader, FiCpu } from 'react-icons/fi';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark text-text-darkPrimary flex flex-col items-center justify-center gap-4">
        <div className="relative flex items-center justify-center">
          <FiLoader className="w-12 h-12 text-primary animate-spin" />
          <FiCpu className="absolute w-5 h-5 text-secondary animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-md font-bold tracking-tight">VoltAnalytics</h3>
          <p className="text-xs text-text-darkSecondary mt-1.5 font-medium animate-pulse">
            Authenticating your session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
