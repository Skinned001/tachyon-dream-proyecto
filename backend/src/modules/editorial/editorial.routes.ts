import { Router } from 'express';

const router = Router();
router.get('/convocatorias', (_req, res) => res.json({ success: true, data: [] }));

export default router;
