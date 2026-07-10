import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0A0F1E' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#6366F1' }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Enforce role-based access
  const path = location.pathname;
  if (path === '/client' && user.role === 'agency') return <Navigate to="/agency" replace />;
  if ((path === '/agency' || path === '/create-project') && user.role === 'client') return <Navigate to="/client" replace />;
  // Task route role guards
  if ((path === '/assign-task' || path === '/task-management') && user.role === 'client') return <Navigate to="/my-tasks" replace />;
  if (path === '/my-tasks' && user.role === 'agency') return <Navigate to="/task-management" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
