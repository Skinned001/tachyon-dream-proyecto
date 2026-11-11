import { Router } from 'express';
import { uploadProfileImage } from '../../config/multer.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { AuthController } from './auth.controller.js';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.post('/logout', authenticateJWT, authController.logout);
router.get('/me', authenticateJWT, authController.me);
router.get('/verify', authenticateJWT, authController.verify);
router.post('/change-password', authenticateJWT, authController.changePassword);
router.put(
  '/profile',
  authenticateJWT,
  uploadProfileImage.single('profile_image'),
  authController.updateProfile,
);

export default router;
