import { Navigate, Route, Routes } from "react-router-dom";
import { PanelConvocatorias } from "../pages/PanelConvocatorias";
import { PanelEditor } from "../pages/PanelEditor";
import { BibliotecaHome } from "../pages/BibliotecaHome";
import { DashboardHome } from "../pages/DashboardHome";
import { AdminUsuarios } from "../pages/AdminUsuarios";
import { Login } from "../pages/Login";
import { MisArticulos } from "../pages/MisArticulos";
import { Notificaciones } from "../pages/Notificaciones";
import { Perfil } from "../pages/Perfil";
import { Registro } from "../pages/Registro";
import { Revisiones } from "../pages/Revisiones";
import { PrivateRoutes } from "./PrivateRoutes";
import { RoleRoute } from "./RoleRoute";
import { PublicRoutes } from "./PublicRoutes";
import { PortalHome } from "../pages/PortalHome";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<PortalHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/register" element={<Registro />} />
      </Route>
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="articulos" element={<MisArticulos />} />
        <Route path="mis-articulos" element={<MisArticulos />} />
        <Route path="revisiones" element={<Revisiones />} />
        <Route path="biblioteca" element={<BibliotecaHome />} />
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="editor" element={<PanelEditor />} />
        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
          <Route path="admin/usuarios" element={<AdminUsuarios />} />
          <Route
            path="admin/usuarios/pendientes"
            element={<Navigate to="/admin/usuarios?tab=solicitudes" replace />}
          />
          <Route path="convocatorias" element={<PanelConvocatorias />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
