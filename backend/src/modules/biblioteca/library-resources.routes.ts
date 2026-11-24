import { Router } from 'express';
import { uploadLibraryResourcePdf } from '../../config/multer.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { LibraryResourcesController } from './library-resources.controller.js';

const router = Router();
const controller = new LibraryResourcesController();

router.get('/', controller.list);
router.post(
  '/',
  authenticateJWT,
  requireRole(['ADMIN', 'EDITOR']),
  uploadLibraryResourcePdf,
  controller.create,
);
router.delete(
  '/:id',
  authenticateJWT,
  requireRole(['ADMIN', 'EDITOR']),
  controller.delete,
);

export default router;
