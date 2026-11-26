import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { PortalController } from './portal.controller.js';
import { uploadNovedadFiles, uploadRevistaFiles } from './portal.upload.js';

const router = Router();
const controller = new PortalController();
const editorsAndAdmins = requireRole(['ADMIN', 'EDITOR']);

router.get('/public', controller.getPublic);

router.get('/revistas', authenticateJWT, editorsAndAdmins, controller.listRevistas);
router.post(
  '/revistas',
  authenticateJWT,
  editorsAndAdmins,
  uploadRevistaFiles,
  controller.createRevista,
);
router.patch(
  '/revistas/:id',
  authenticateJWT,
  editorsAndAdmins,
  controller.updateRevista,
);
router.delete(
  '/revistas/:id',
  authenticateJWT,
  editorsAndAdmins,
  controller.deleteRevista,
);

router.get('/novedades', authenticateJWT, editorsAndAdmins, controller.listNovedades);
router.post(
  '/novedades',
  authenticateJWT,
  editorsAndAdmins,
  uploadNovedadFiles,
  controller.createNovedad,
);
router.patch(
  '/novedades/:id',
  authenticateJWT,
  editorsAndAdmins,
  controller.updateNovedad,
);
router.delete(
  '/novedades/:id',
  authenticateJWT,
  editorsAndAdmins,
  controller.deleteNovedad,
);

export default router;
