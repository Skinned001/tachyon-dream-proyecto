import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { MetricasController } from './metricas.controller.js';

const router = Router();
const controller = new MetricasController();

router.post('/track', controller.track);
router.get(
  '/overview',
  authenticateJWT,
  requireRole(['ADMIN', 'EDITOR']),
  controller.overview,
);

export default router;
