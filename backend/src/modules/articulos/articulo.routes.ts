import { Router } from 'express';
import { uploadPdf } from '../../config/multer.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireAuthor, requireRole } from '../../middlewares/role.middleware.js';
import { ArticuloController } from './articulo.controller.js';

const router = Router();
const articuloController = new ArticuloController();

router.get('/publicados', articuloController.listarPublicados);
router.get('/publicados/:id/pdf', articuloController.descargarPublicado);

router.get(
  '/revisores',
  authenticateJWT,
  requireRole(['DDI', 'ADMIN']),
  articuloController.listarRevisores,
);

router.post(
  '/',
  authenticateJWT,
  requireAuthor,
  uploadPdf.single('file'),
  articuloController.crear,
);

router.get('/', authenticateJWT, articuloController.listar);

router.get('/:id/pdf', authenticateJWT, articuloController.descargarPdfPrivado);
router.get(
  '/:id/versions/:versionId/pdf',
  authenticateJWT,
  articuloController.descargarPdfPrivado,
);

router.post(
  '/:id/versiones',
  authenticateJWT,
  requireAuthor,
  uploadPdf.single('file'),
  articuloController.subirVersion,
);

router.patch(
  '/:id/rechazar-ddi',
  authenticateJWT,
  requireRole(['DDI', 'ADMIN']),
  articuloController.rechazarDdi,
);

router.put(
  '/:id/asignar',
  authenticateJWT,
  requireRole(['DDI', 'ADMIN']),
  articuloController.asignarRevisores,
);

router.post(
  '/:id/dictamen',
  authenticateJWT,
  requireRole(['COMITE', 'ADMIN']),
  articuloController.emitirDictamen,
);

router.post(
  '/:id/aprobar-correccion',
  authenticateJWT,
  requireRole(['EDITOR', 'ADMIN']),
  articuloController.aprobarCorreccion,
);

router.patch(
  '/:id/publicar',
  authenticateJWT,
  requireRole(['EDITOR', 'ADMIN']),
  articuloController.publicar,
);

router.patch(
  '/:id/retirar',
  authenticateJWT,
  requireRole(['EDITOR', 'ADMIN']),
  articuloController.retirar,
);

export default router;
