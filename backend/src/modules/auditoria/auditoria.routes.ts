import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { AuditoriaController } from './auditoria.controller.js';

const router = Router();
const controller = new AuditoriaController();

router.use(authenticateJWT, requireRole(['ADMIN']));
router.get('/', controller.listar);

export default router;
