import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { NotificacionesController } from './notificaciones.controller.js';

const router = Router();
const controller = new NotificacionesController();

router.use(authenticateJWT);
router.get('/', controller.list);
router.put('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);

export default router;
