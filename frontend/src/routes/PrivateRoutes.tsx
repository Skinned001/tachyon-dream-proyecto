import { Route, Routes } from 'react-router-dom';
import { DashboardHome } from '../pages/DashboardHome';
import { MisArticulos } from '../pages/MisArticulos';
import { Revisiones } from '../pages/Revisiones';
import { BibliotecaHome } from '../pages/BibliotecaHome';

export function PrivateRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/mis-articulos" element={<MisArticulos />} />
      <Route path="/revisiones" element={<Revisiones />} />
      <Route path="/biblioteca" element={<BibliotecaHome />} />
    </Routes>
  );
}
