import { Navigate, Route, Routes } from 'react-router-dom';
import { BibliotecaHome } from '../pages/BibliotecaHome';
import { DashboardHome } from '../pages/DashboardHome';
import { AdminUsuarios } from '../pages/AdminUsuarios';
import { Login } from '../pages/Login';
import { MisArticulos } from '../pages/MisArticulos';
import { PortalHome } from '../pages/PortalHome';
import { Revisiones } from '../pages/Revisiones';
import { PrivateRoutes } from './PrivateRoutes';
import { RoleRoute } from './RoleRoute';
import { PublicRoutes } from './PublicRoutes';

export function AppRoutes() {
  return (
    <Routes>
<<<<<<< HEAD
      <Route path="/" element={<PortalHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Navigate replace to="/login" />} />
=======
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>
>>>>>>> 9b0ceac6cead46569a8b1d827f07b41f3a9988d8
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="articulos" element={<MisArticulos />} />
        <Route path="mis-articulos" element={<MisArticulos />} />
        <Route path="revisiones" element={<Revisiones />} />
        <Route path="biblioteca" element={<BibliotecaHome />} />
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="admin/usuarios" element={<AdminUsuarios />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
