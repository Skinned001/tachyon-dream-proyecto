import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { requireAuthorOrRole } from '../../middlewares/role.middleware.js';
import { AiController } from './ai.controller.js';

const router = Router();
const aiController = new AiController();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 6,
    fields: 10,
  },
});
const parseSimilarityFiles = upload.fields([
  { name: 'targetFile', maxCount: 1 },
  { name: 'referenceFiles', maxCount: 5 },
]);

const handleUploadErrors: RequestHandler = (req, res, next) => {
  parseSimilarityFiles(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const status = ['LIMIT_FILE_SIZE', 'LIMIT_FILE_COUNT'].includes(error.code)
        ? 413
        : 400;
      res.status(status).json({
        success: false,
        error:
          status === 413
            ? 'Se superó el límite de tamaño o cantidad de archivos.'
            : 'Los campos de archivos de la solicitud no son válidos.',
      });
      return;
    }

    if (error instanceof Error) {
      res.status(400).json({ success: false, error: 'No se pudieron leer los archivos.' });
      return;
    }

    if (error !== undefined) {
      next(error);
      return;
    }
    next();
  });
};

router.post(
  '/similarity/check',
  authenticateJWT,
  requireAuthorOrRole(['DDI', 'COMITE', 'ADMIN']),
  handleUploadErrors,
  aiController.analyzeSimilarity,
);

export default router;
