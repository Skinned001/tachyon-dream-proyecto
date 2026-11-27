import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { EditorialController } from './editorial.controller.js';

const router = Router();
const controller = new EditorialController();

router.get('/publicas', controller.listarPublicas);
router.get('/', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), controller.listar);
router.post('/', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), controller.crear);
router.put('/:id', authenticateJWT, requireRole(['ADMIN', 'EDITOR']), controller.editar);
router.patch(
  '/:id/finalizar',
  authenticateJWT,
  requireRole(['ADMIN', 'EDITOR']),
  controller.finalizar,
);

export default router;
