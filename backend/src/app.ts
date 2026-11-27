import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import especialidadesRoutes from "./modules/especialidades/especialidades.routes.js";
import articulosRoutes from "./modules/articulos/articulo.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import bibliotecaRoutes from "./modules/biblioteca/biblioteca.routes.js";
import libraryResourcesRoutes from "./modules/biblioteca/library-resources.routes.js";
import notificacionesRoutes from "./modules/notificaciones/notificaciones.routes.js";
import usuariosRoutes from "./modules/usuarios/usuarios.routes.js";
import editorialRoutes from "./modules/editorial/editorial.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import auditoriaRoutes from "./modules/auditoria/auditoria.routes.js";
import metricasRoutes from "./modules/metricas/metricas.routes.js";
import portalRoutes from "./modules/portal/portal.routes.js";
import { uploadsDirectory } from "./config/uploads.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();
const corsOptions = {
  origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  credentials: true,
  exposedHeaders: ["Content-Disposition"],
};
const uploadsCors = cors(corsOptions);
const uploadsPath = path.resolve(uploadsDirectory);

console.log(`Serving uploaded files from: ${uploadsPath}`);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  '/uploads/profiles',
  uploadsCors,
  express.static(path.join(uploadsPath, 'profiles'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }),
);
app.use(
  '/uploads/avatars',
  uploadsCors,
  express.static(path.join(uploadsPath, 'avatars'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }),
);
app.use(
  '/uploads/library',
  uploadsCors,
  express.static(path.join(uploadsPath, 'library'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }),
);
app.use(
  '/uploads/portal',
  uploadsCors,
  express.static(path.join(uploadsPath, 'portal'), {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  }),
);

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/articulos", articulosRoutes);
app.use("/api/biblioteca", bibliotecaRoutes);
app.use("/api/library-resources", libraryResourcesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/especialidades", especialidadesRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/convocatorias", editorialRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auditoria", auditoriaRoutes);
app.use("/api/metricas", metricasRoutes);
app.use("/api/portal", portalRoutes);

app.use(errorMiddleware);

export default app;
