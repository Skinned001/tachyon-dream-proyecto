import { Navigate, Route, Routes } from 'react-router-dom';
import { BibliotecaHome } from '../pages/BibliotecaHome';
import { DashboardHome } from '../pages/DashboardHome';
import { AdminUsuarios } from '../pages/AdminUsuarios';
import { Login } from '../pages/Login';
import { MisArticulos } from '../pages/MisArticulos';
import { PortalHome } from '../pages/PortalHome';
import { Registro } from '../pages/Registro';
import { Revisiones } from '../pages/Revisiones';
import { PrivateRoutes } from './PrivateRoutes';
import { RoleRoute } from './RoleRoute';
import { PublicRoutes } from './PublicRoutes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortalHome />} />
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>
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
