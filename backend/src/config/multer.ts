import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

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

    const directory = path.resolve(process.cwd(), 'uploads', subdirectory);

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
