import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AccessLevel, AppSection } from '@dpd/shared';
import { useAuth } from './auth-context';
import { useAccess } from './use-access';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-secondary">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-secondary">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function SectionRoute({
  section,
  level = AccessLevel.VIEW,
}: {
  section: AppSection;
  level?: AccessLevel;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const { canAccess } = useAccess();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-secondary">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess(section, level)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { isLoading, isAuthenticated } = useAuth();
  const { canAccess } = useAccess();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-secondary">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess(AppSection.ADMIN, AccessLevel.MANAGE)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
