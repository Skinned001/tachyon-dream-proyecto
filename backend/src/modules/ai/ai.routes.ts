import { Router } from 'express';

const router = Router();
router.post('/generate', (_req, res) => res.json({ success: true, message: 'AI route ready' }));

export default router;
