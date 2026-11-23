import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user.types';

interface RoleRouteProps {
  allowedRoles?: UserRole[];
  requireAuthor?: boolean;
}

export const RoleRoute = ({
  allowedRoles = [],
  requireAuthor = false,
}: RoleRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Verificando permisos...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const hasRoleAccess = allowedRoles.includes(user.role);
  const hasAuthorAccess =
    requireAuthor && (user.is_author || user.role === 'ADMIN');

  return hasRoleAccess || hasAuthorAccess ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};
