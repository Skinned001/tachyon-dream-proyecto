import { Router } from "express";
import {
  authenticateJWT,
  optionalAuthenticateJWT,
} from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { EspecialidadesController } from "./especialidades.controller.js";

const router = Router();
const controller = new EspecialidadesController();

router.get("/", optionalAuthenticateJWT, controller.list);
router.post("/", authenticateJWT, requireRole(['ADMIN']), controller.create);
router.put(
  '/:id',
  authenticateJWT,
  requireRole(['ADMIN']),
  controller.update,
);

export default router;
