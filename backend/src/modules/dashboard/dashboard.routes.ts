import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { DashboardController } from './dashboard.controller.js';

const router = Router();
const controller = new DashboardController();

router.get('/summary', authenticateJWT, controller.summary);

export default router;
