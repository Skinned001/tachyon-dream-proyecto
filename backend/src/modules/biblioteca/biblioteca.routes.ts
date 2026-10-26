import { Router } from 'express';
import { uploadPdf } from '../../config/multer.js';
import {
  authenticateJWT,
  optionalAuthenticateJWT,
} from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { BibliotecaController } from './biblioteca.controller.js';

const router = Router();
const bibliotecaController = new BibliotecaController();
const adminOnly = requireRole(['ADMIN']);

router.get('/', optionalAuthenticateJWT, bibliotecaController.listar);
router.get('/:id', optionalAuthenticateJWT, bibliotecaController.obtenerPorId);
router.post(
  '/',
  authenticateJWT,
  adminOnly,
  uploadPdf.single('file'),
  bibliotecaController.crear,
);
router.put('/:id', authenticateJWT, adminOnly, bibliotecaController.actualizar);
router.delete('/:id', authenticateJWT, adminOnly, bibliotecaController.eliminar);

export default router;
