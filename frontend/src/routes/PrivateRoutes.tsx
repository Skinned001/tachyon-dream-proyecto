import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const PrivateRoutes = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div role="status" className="flex min-h-[100dvh] items-center justify-center text-sm text-[#52766d]">
        Verificando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <DashboardLayout onSignOut={handleSignOut}>
      <Outlet />
    </DashboardLayout>
  );
};

export default PrivateRoutes;
