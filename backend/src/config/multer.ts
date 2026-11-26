import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import multer from 'multer';
import { uploadsDirectory } from './uploads.js';

const profileImageExtensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const profileImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const directory = path.join(uploadsDirectory, 'avatars');
    try {
      fs.mkdirSync(directory, { recursive: true });
      cb(null, directory);
    } catch (error) {
      cb(error instanceof Error ? error : new Error('No se pudo crear el directorio de fotos de perfil.'), '');
    }
  },
  filename: (_req, file, cb) => {
    const extension = profileImageExtensions[file.mimetype];
    if (!extension) {
      cb(new Error('Formato de imagen no permitido: use JPG, PNG o WebP.'), '');
      return;
    }
    cb(null, `${randomUUID()}${extension}`);
  },
});

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!profileImageExtensions[file.mimetype]) {
      cb(new Error('Formato de imagen no permitido: use JPG, PNG o WebP.'));
      return;
    }
    cb(null, true);
  },
});

const credentialExtensions: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

class UploadValidationError extends Error {
  readonly statusCode = 400;
}

const credentialStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const directory = path.join(uploadsDirectory, 'credentials');
    try {
      fs.mkdirSync(directory, { recursive: true });
      cb(null, directory);
    } catch (error) {
      cb(error instanceof Error ? error : new Error('No se pudo crear el directorio de credenciales.'), '');
    }
  },
  filename: (_req, file, cb) => {
    const extension = credentialExtensions[file.mimetype];
    if (!extension) {
      cb(new Error('Formato de credencial no permitido: use PDF, JPG o PNG.'), '');
      return;
    }
    cb(null, `${randomUUID()}${extension}`);
  },
});

export const uploadCredential = multer({
  storage: credentialStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!credentialExtensions[file.mimetype]) {
      cb(
        new UploadValidationError(
          'Formato de credencial no permitido: use PDF, JPG o PNG.',
        ),
      );
      return;
    }
    cb(null, true);
  },
});

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const requestPath = `${req.originalUrl} ${req.baseUrl}`;
    const subdirectory = requestPath.includes('/biblioteca')
      ? 'library'
      : requestPath.includes('/articulos')
        ? 'articles'
        : null;

    if (!subdirectory) {
      cb(new Error('No se pudo determinar el directorio de destino para la carga.'), '');
      return;
    }

    const directory = path.join(uploadsDirectory, subdirectory);

    try {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      cb(null, directory);
    } catch (error) {
      cb(error instanceof Error ? error : new Error('No se pudo crear el directorio de carga.'), '');
    }
  },
  filename: (_req, file, cb) => {
    const sanitizedName = path.basename(file.originalname.replace(/[\\/]/g, '_')).replace(/\s+/g, '');
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Formato de archivo no permitido: solo se aceptan archivos PDF.'));
    return;
  }

  cb(null, true);
};

const limits: multer.Options['limits'] = {
  fileSize: 10 * 1024 * 1024,
};

export const uploadPdf = multer({ storage, fileFilter, limits });
export const upload = uploadPdf;

class LibraryPdfUploadError extends Error {
  readonly statusCode = 400;
}

const libraryPdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const directory = path.join(uploadsDirectory, 'library');
    try {
      fs.mkdirSync(directory, { recursive: true });
      cb(null, directory);
    } catch (error) {
      cb(
        error instanceof Error
          ? error
          : new Error('No se pudo crear el directorio de documentos de Biblioteca.'),
        '',
      );
    }
  },
  filename: (_req, _file, cb) => {
    cb(null, `${randomUUID()}.pdf`);
  },
});

const libraryPdfUpload = multer({
  storage: libraryPdfStorage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new LibraryPdfUploadError('El archivo debe ser un PDF (application/pdf).'));
      return;
    }
    cb(null, true);
  },
});

export const uploadLibraryResourcePdf: RequestHandler = (req, res, next) => {
  libraryPdfUpload.single('file')(req, res, (error: unknown) => {
    if (
      error instanceof multer.MulterError &&
      error.code === 'LIMIT_FILE_SIZE'
    ) {
      next(new LibraryPdfUploadError('El PDF no puede superar los 20 MB.'));
      return;
    }
    next(error);
  });
};
