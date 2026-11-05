import { Navigate, Route, Routes } from 'react-router-dom';
import { BibliotecaHome } from '../pages/BibliotecaHome';
import { DashboardHome } from '../pages/DashboardHome';
import { Login } from '../pages/Login';
import { MisArticulos } from '../pages/MisArticulos';
import { PortalHome } from '../pages/PortalHome';
import { Revisiones } from '../pages/Revisiones';
import { PrivateRoutes } from './PrivateRoutes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortalHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Navigate replace to="/login" />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="articulos" element={<MisArticulos />} />
        <Route path="revisiones" element={<Revisiones />} />
        <Route path="biblioteca" element={<BibliotecaHome />} />
      </Route>
    </Routes>
  );
}
