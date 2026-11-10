import { Router } from 'express';
import { uploadPdf } from '../../config/multer.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireAuthor, requireRole } from '../../middlewares/role.middleware.js';
import { ArticuloController } from './articulo.controller.js';

const router = Router();
const articuloController = new ArticuloController();

router.get('/publicados', articuloController.listarPublicados);
router.get('/publicados/:id/pdf', articuloController.descargarPublicado);
router.post(
  '/',
  authenticateJWT,
  requireAuthor,
  uploadPdf.single('file'),
  articuloController.crear,
);
router.get('/', authenticateJWT, articuloController.listar);
router.put(
  '/:id/status',
  authenticateJWT,
  requireRole(['COMITE', 'ADMIN']),
  articuloController.actualizarEstado,
);

export default router;
