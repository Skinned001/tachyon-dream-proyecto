import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { Op, type WhereOptions } from 'sequelize';
import { uploadsDirectory } from '../../config/uploads.js';
import { Especialidad } from '../especialidades/Especialidad.model.js';
import { Usuario } from '../usuarios/Usuario.model.js';
import { RecursoBiblioteca } from './RecursoBiblioteca.model.js';
import type {
  CreateInstitutionalLibraryResourceInput,
  InstitutionalLibraryResourceDTO,
  InstitutionalLibraryResourceFilters,
} from './library-resources.dto.js';

const uploaderInclude = {
  model: Usuario,
  as: 'uploader',
  attributes: ['id', 'username', 'first_name', 'last_name'],
};

const specialtyInclude = {
  model: Especialidad,
  as: 'specialty',
  attributes: ['id', 'name'],
  required: false,
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const toDTO = (
  resource: RecursoBiblioteca,
  uploader = resource.uploader,
  specialty = resource.specialty,
): InstitutionalLibraryResourceDTO => ({
  id: resource.id,
  title: resource.title,
  description: resource.description,
  category: resource.category,
  fileUrl:
    resource.fileUrl ??
    `/uploads/library/${path.basename(resource.file_path.replace(/[\\/]/g, path.sep))}`,
  fileName:
    resource.fileName ??
    path.basename(resource.file_path.replace(/[\\/]/g, path.sep)),
  uploadedBy: resource.uploadedBy,
  ...(uploader
    ? {
        uploader: {
          id: uploader.id,
          username: uploader.username,
          first_name: uploader.first_name,
          last_name: uploader.last_name,
        },
      }
    : {}),
  specialtyId: resource.specialtyId ?? null,
  specialty: specialty ? { id: specialty.id, name: specialty.name } : null,
  createdAt: resource.createdAt.toISOString(),
  updatedAt: resource.updatedAt?.toISOString() ?? null,
});

const isMissingFileError = (error: unknown): boolean =>
  error instanceof Error &&
  'code' in error &&
  error.code === 'ENOENT';

const getLibraryFilePath = (resource: RecursoBiblioteca): string => {
  let fileName: string;

  if (resource.fileUrl) {
    const prefix = '/uploads/library/';
    if (!resource.fileUrl.startsWith(prefix)) {
      throw new Error('La URL del recurso no apunta al directorio de Biblioteca.');
    }
    fileName = resource.fileUrl.slice(prefix.length);
  } else {
    const normalizedPath = resource.file_path.replace(/\\/g, '/');
    if (!normalizedPath.includes('/library/')) {
      throw new Error('La ruta del recurso no apunta al directorio de Biblioteca.');
    }
    const pathSegments = normalizedPath.split('/');
    fileName = pathSegments[pathSegments.length - 1] ?? '';
  }

  if (!fileName || fileName.includes('/') || fileName.includes('\\') || fileName === '.' || fileName === '..') {
    throw new Error('El nombre del archivo de Biblioteca no es válido.');
  }

  const libraryDirectory = path.resolve(uploadsDirectory, 'library');
  const filePath = path.resolve(libraryDirectory, fileName);
  if (path.dirname(filePath) !== libraryDirectory) {
    throw new Error('La ruta del archivo está fuera del directorio de Biblioteca.');
  }
  return filePath;
};

export class LibraryResourcesError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'LibraryResourcesError';
  }
}

export class LibraryResourcesService {
  async list(
    filters: InstitutionalLibraryResourceFilters = {},
  ): Promise<InstitutionalLibraryResourceDTO[]> {
    const where: WhereOptions = { visibility: 'PUBLICO' };
    if (filters.category) {
      Object.assign(where, { category: filters.category });
    }
    if (filters.search) {
      const searchPattern = `%${filters.search}%`;
      Object.assign(where, {
        [Op.or]: [
          { title: { [Op.like]: searchPattern } },
          { description: { [Op.like]: searchPattern } },
        ],
      });
    }

    const resources = await RecursoBiblioteca.findAll({
      where,
      include: [uploaderInclude, specialtyInclude],
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return resources.map((resource) => toDTO(resource));
  }

  async create(
    input: CreateInstitutionalLibraryResourceInput,
    file: Express.Multer.File,
    uploadedBy: number,
  ): Promise<InstitutionalLibraryResourceDTO> {
    const uploader = await Usuario.findByPk(uploadedBy);
    if (!uploader) {
      throw new LibraryResourcesError(404, 'No se encontró el usuario que sube el recurso.');
    }

    let specialty: Especialidad | null = null;
    if (input.specialtyId) {
      specialty = await Especialidad.findByPk(input.specialtyId, {
        attributes: ['id', 'name'],
      });
      if (!specialty) {
        throw new LibraryResourcesError(400, 'La especialidad seleccionada no existe.');
      }
    }

    const fileUrl = `/uploads/library/${path.basename(file.path)}`;
    const resource = await RecursoBiblioteca.create({
      title: input.title,
      description: input.description?.trim() || null,
      category: input.category,
      file_path: path.relative(process.cwd(), file.path),
      file_size: formatFileSize(file.size),
      fileUrl,
      fileName: file.originalname,
      visibility: 'PUBLICO',
      uploadedBy,
      specialtyId: specialty?.id ?? null,
    });
    return toDTO(resource, uploader, specialty ?? undefined);
  }

  async delete(id: number): Promise<void> {
    const resource = await RecursoBiblioteca.findByPk(id);
    if (!resource) {
      throw new LibraryResourcesError(404, 'Recurso de Biblioteca no encontrado.');
    }

    const filePath = getLibraryFilePath(resource);
    try {
      await unlink(filePath);
    } catch (error: unknown) {
      if (!isMissingFileError(error)) {
        throw error;
      }
    }

    await resource.destroy();
  }
}
