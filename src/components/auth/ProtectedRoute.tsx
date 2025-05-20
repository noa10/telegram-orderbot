import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: string;
}

/**
 * ProtectedRoute component that checks if the user is authenticated and has the required role
 * If not authenticated, redirects to login page
 * If authenticated but doesn't have the required role, redirects to access denied page
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole = 'user' }) => {
  const { user, isLoading, userRole, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin, allow access to any protected route
  if (isAdmin) {
    return <Outlet />;
  }

  // If role is required and user doesn't have it, redirect to access denied
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/access-denied" replace />;
  }

  // User is authenticated and has the required role, render the protected route
  return <Outlet />;
};

export default ProtectedRoute;
