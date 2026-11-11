import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import articulosRoutes from "./modules/articulos/articulo.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import bibliotecaRoutes from "./modules/biblioteca/biblioteca.routes.js";
import usuariosRoutes from "./modules/usuarios/usuarios.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  '/uploads/profiles',
  express.static(path.resolve(process.cwd(), 'uploads', 'profiles')),
);
app.use(
  '/uploads/avatars',
  express.static(path.resolve(process.cwd(), 'uploads', 'avatars')),
);

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/articulos", articulosRoutes);
app.use("/api/biblioteca", bibliotecaRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.use(errorMiddleware);

export default app;
