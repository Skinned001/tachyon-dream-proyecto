import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { BibliotecaHome } from '../pages/BibliotecaHome';

export const BibliotecaRoute = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error: unknown) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      navigate('/', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex min-h-[100dvh] items-center justify-center bg-[#f2f7f4] text-sm text-[#52766d]"
      >
        Verificando sesión...
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <DashboardLayout onSignOut={handleSignOut}>
        <BibliotecaHome />
      </DashboardLayout>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#f2f7f4] px-5 py-8 md:px-9 md:py-10">
      <div className="mx-auto max-w-[1440px]">
        <BibliotecaHome />
      </div>
    </main>
  );
};
