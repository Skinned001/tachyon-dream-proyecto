import { Router } from 'express';
import { EspecialidadesController } from './especialidades.controller.js';

const router = Router();
const controller = new EspecialidadesController();

router.get('/', controller.list);

export default router;
