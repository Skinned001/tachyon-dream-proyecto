import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { uploadsDirectory } from '../../config/uploads.js';

export const portalUploadsDirectory = path.resolve(uploadsDirectory, 'portal');
fs.mkdirSync(portalUploadsDirectory, { recursive: true });

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const extensionByMime: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/x-pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const isPdfFile = (file: Express.Multer.File): boolean =>
  file.mimetype === 'application/pdf' ||
  file.mimetype === 'application/x-pdf' ||
  path.extname(file.originalname).toLowerCase() === '.pdf';

const isImageFile = (file: Express.Multer.File): boolean =>
  allowedImageMimeTypes.has(file.mimetype) ||
  /\.(jpe?g|png|webp|gif|avif)$/i.test(file.originalname);

class PortalUploadError extends Error {
  readonly statusCode = 400;
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(portalUploadsDirectory, { recursive: true });
    callback(null, portalUploadsDirectory);
  },
  filename: (_req, file, callback) => {
    const ext =
      extensionByMime[file.mimetype] ??
      path.extname(file.originalname).toLowerCase() ??
      '';
    callback(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

export const uploadRevistaFiles = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === 'pdf') {
      if (!isPdfFile(file)) {
        callback(
          new PortalUploadError('La revista debe adjuntarse en formato PDF.'),
        );
        return;
      }
      callback(null, true);
      return;
    }
    if (file.fieldname === 'cover') {
      if (!isImageFile(file)) {
        callback(
          new PortalUploadError('La portada debe ser JPG, PNG o WebP.'),
        );
        return;
      }
      callback(null, true);
      return;
    }
    callback(new PortalUploadError('Campo de archivo no permitido.'));
  },
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

export const uploadNovedadFiles = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === 'image') {
      if (!isImageFile(file)) {
        callback(
          new PortalUploadError('La imagen debe ser JPG, PNG o WebP.'),
        );
        return;
      }
      callback(null, true);
      return;
    }
    if (file.fieldname === 'attachment') {
      if (!isPdfFile(file)) {
        callback(
          new PortalUploadError('El adjunto debe ser un archivo PDF.'),
        );
        return;
      }
      callback(null, true);
      return;
    }
    callback(new PortalUploadError('Campo de archivo no permitido.'));
  },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'attachment', maxCount: 1 },
]);
