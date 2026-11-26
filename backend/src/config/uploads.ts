import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const uploadsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../uploads',
);
