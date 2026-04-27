import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

export function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="size-full overflow-y-auto bg-background">
      <Outlet />
    </div>
  );
}
