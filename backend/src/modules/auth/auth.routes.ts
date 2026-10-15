import { Router } from 'express';

const router = Router();

router.post('/login', (_req, res) => res.json({ success: true, message: 'Login endpoint' }));
router.post('/register', (_req, res) => res.json({ success: true, message: 'Register endpoint' }));

export default router;
