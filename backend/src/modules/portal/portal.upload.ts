import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { uploadsDirectory } from '../../config/uploads.js';

export const portalUploadsDirectory = path.resolve(uploadsDirectory, 'portal');
fs.mkdirSync(portalUploadsDirectory, { recursive: true });

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const extensionByMime: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

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
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === 'pdf') {
      if (file.mimetype !== 'application/pdf') {
        callback(new Error('La revista debe adjuntarse en formato PDF.'));
        return;
      }
      callback(null, true);
      return;
    }
    if (file.fieldname === 'cover') {
      if (!allowedImageMimeTypes.has(file.mimetype)) {
        callback(new Error('La portada debe ser JPG, PNG o WebP.'));
        return;
      }
      callback(null, true);
      return;
    }
    callback(new Error('Campo de archivo no permitido.'));
  },
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

export const uploadNovedadFiles = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.fieldname === 'image') {
      if (!allowedImageMimeTypes.has(file.mimetype)) {
        callback(new Error('La imagen debe ser JPG, PNG o WebP.'));
        return;
      }
      callback(null, true);
      return;
    }
    if (file.fieldname === 'attachment') {
      if (file.mimetype !== 'application/pdf') {
        callback(new Error('El adjunto debe ser un archivo PDF.'));
        return;
      }
      callback(null, true);
      return;
    }
    callback(new Error('Campo de archivo no permitido.'));
  },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'attachment', maxCount: 1 },
]);
