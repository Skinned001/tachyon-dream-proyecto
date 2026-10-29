import { Route, Routes } from 'react-router-dom';
import { BibliotecaHome } from '../pages/BibliotecaHome';
import { DashboardHome } from '../pages/DashboardHome';
import { Login } from '../pages/Login';
import { MisArticulos } from '../pages/MisArticulos';
import { Registro } from '../pages/Registro';
import { Revisiones } from '../pages/Revisiones';
import { PrivateRoutes } from './PrivateRoutes';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route element={<PrivateRoutes />}>
        <Route index element={<DashboardHome />} />
        <Route path="articulos" element={<MisArticulos />} />
        <Route path="revisiones" element={<Revisiones />} />
        <Route path="biblioteca" element={<BibliotecaHome />} />
      </Route>
    </Routes>
  );
}
