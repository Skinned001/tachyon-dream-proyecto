import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const PrivateRoutes = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
    window.location.reload();
  };

  if (!token) return <Navigate replace to="/login" />;

  return (
    <DashboardLayout onSignOut={handleSignOut}>
      <Outlet />
    </DashboardLayout>
  );
};

export default PrivateRoutes;
