import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks";
import type { UserRole } from "../models";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Protected Route Component
 * Prevents unauthorized access to protected pages by checking authentication status.
 * Redirects to login page if user is not authenticated.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && (!user || !allowedRoles.includes(user.role))) {
    const fallbackPath = user?.role === "Admin" ? "/sysadmin/rbac" : "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
