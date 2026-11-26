import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { NotificacionesController } from './notificaciones.controller.js';

const router = Router();
const controller = new NotificacionesController();

router.use(authenticateJWT);
router.get('/', controller.list);
router.patch('/leer-todas', controller.markAllAsRead);
router.patch('/preferencias', controller.updatePreferences);
router.patch('/:id/leer', controller.markAsRead);

// Keep the previous routes available for existing clients.
router.put('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);

export default router;
