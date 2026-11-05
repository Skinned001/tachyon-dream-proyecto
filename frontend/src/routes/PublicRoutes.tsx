<<<<<<< HEAD
import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from '../pages/Login';
import { PortalHome } from '../pages/PortalHome';
=======
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
>>>>>>> 9b0ceac6cead46569a8b1d827f07b41f3a9988d8

export function PublicRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div role="status" className="flex min-h-[100dvh] items-center justify-center text-sm text-[#52766d]">
        Verificando sesión...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
<<<<<<< HEAD
    <Routes>
      <Route path="/" element={<PortalHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Navigate replace to="/login" />} />
    </Routes>
=======
    <Outlet />
>>>>>>> 9b0ceac6cead46569a8b1d827f07b41f3a9988d8
  );
}
