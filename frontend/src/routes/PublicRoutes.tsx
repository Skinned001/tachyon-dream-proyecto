import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from '../pages/Login';
import { PortalHome } from '../pages/PortalHome';

export function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortalHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Navigate replace to="/login" />} />
    </Routes>
  );
}
