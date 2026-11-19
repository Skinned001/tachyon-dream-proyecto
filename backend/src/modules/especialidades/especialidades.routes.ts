import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { EspecialidadesController } from './especialidades.controller.js';

const router = Router();
const controller = new EspecialidadesController();
const adminOnly = requireRole(['ADMIN']);

router.get('/', controller.list);
router.get('/admin', authenticateJWT, adminOnly, controller.listAll);
router.post('/', authenticateJWT, adminOnly, controller.create);
router.put('/:id', authenticateJWT, adminOnly, controller.update);

export default router;
