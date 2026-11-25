import { Navigate, Route, Routes } from "react-router-dom";
import { PanelConvocatorias } from "../pages/PanelConvocatorias";
import { PanelEditor } from "../pages/PanelEditor";
import { BibliotecaRoute } from "./BibliotecaRoute";
import { DashboardHome } from "../pages/DashboardHome";
import { AdminAuditoria } from "../pages/AdminAuditoria";
import { AdminMetricas } from "../pages/AdminMetricas";
import { AdminUsuarios } from "../pages/AdminUsuarios";
import { AdminEspecialidades } from "../pages/AdminEspecialidades";
import { Login } from "../pages/Login";
import { MesaEntradaDDI } from "../pages/MesaEntradaDDI";
import { MisArticulos } from "../pages/MisArticulos";
import { Notificaciones } from "../pages/Notificaciones";
import { Perfil } from "../pages/Perfil";
import { RecursosBibliotecaAdmin } from "../pages/RecursosBibliotecaAdmin";
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
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/register" element={<Registro />} />
      </Route>
      <Route path="/" element={<PortalHome />} />
      <Route path="/biblioteca" element={<BibliotecaRoute />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route element={<RoleRoute requireAuthor />}>
          <Route path="articulos" element={<MisArticulos />} />
          <Route path="mis-articulos" element={<MisArticulos />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["DDI", "ADMIN"]} />}>
          <Route path="mesa-entrada" element={<MesaEntradaDDI />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["COMITE", "ADMIN"]} />}>
          <Route path="revisiones" element={<Revisiones />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["EDITOR", "ADMIN"]} />}>
          <Route path="editor" element={<PanelEditor />} />
        </Route>
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="perfil" element={<Perfil />} />
        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
          <Route path="admin/usuarios" element={<AdminUsuarios />} />
          <Route
            path="admin/usuarios/pendientes"
            element={<Navigate to="/admin/usuarios?tab=solicitudes" replace />}
          />
          <Route path="admin/auditoria" element={<AdminAuditoria />} />
          <Route
            path="admin/especialidades"
            element={<AdminEspecialidades />}
          />
        </Route>
        <Route element={<RoleRoute allowedRoles={["ADMIN", "EDITOR"]} />}>
          <Route path="convocatorias" element={<PanelConvocatorias />} />
          <Route
            path="recursos-biblioteca"
            element={<RecursosBibliotecaAdmin />}
          />
          <Route path="admin/metricas" element={<AdminMetricas />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
