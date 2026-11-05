import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UsuariosController } from './usuarios.controller.js';

const router = Router();
const usuariosController = new UsuariosController();

router.use(authenticateJWT, requireRole(['ADMIN']));

router.get('/', usuariosController.list);
router.post('/', usuariosController.create);
router.put('/:id', usuariosController.update);
router.delete('/:id', usuariosController.delete);
router.post('/:id/reset-password', usuariosController.resetPassword);

export default router;
