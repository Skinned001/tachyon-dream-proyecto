import fs from 'node:fs';
import path from 'node:path';
import { Op, type WhereOptions } from 'sequelize';
import { Especialidad } from '../especialidades/Especialidad.model.js';
import type { RoleName } from '../auth/auth.dto.js';
import { RecursoBiblioteca } from './RecursoBiblioteca.model.js';
import type {
  CreateLibraryResourceRequest,
  LibraryResourceDTO,
  LibraryResourceFilters,
  LibraryVisibility,
  UpdateLibraryResourceRequest,
} from './biblioteca.dto.js';

const allowedVisibilities = (userRole?: RoleName): LibraryVisibility[] => {
  if (userRole === 'DDI' || userRole === 'COMITE' || userRole === 'ADMIN') {
    return ['PUBLICO', 'INTERNO', 'CONFIDENCIAL'];
  }
  if (userRole === 'AUTOR' || userRole === 'PUBLISHER') {
    return ['PUBLICO', 'INTERNO'];
  }
  return ['PUBLICO'];
};

export class BibliotecaError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'BibliotecaError';
  }
}

const specialtyInclude = {
  model: Especialidad,
  as: 'specialty',
  attributes: ['id', 'name', 'description', 'active'],
};

const toLibraryResourceDTO = (
  resource: RecursoBiblioteca,
): LibraryResourceDTO => {
  const specialty = resource.specialty;

  return {
    id: resource.id,
    title: resource.title,
    category: resource.category,
    file_path: resource.file_path,
    file_size: resource.file_size,
    visibility: resource.visibility,
    uploadedBy: resource.uploadedBy,
    specialtyId: resource.specialtyId,
    ...(specialty
      ? {
          specialty: {
            id: specialty.id,
            name: specialty.name,
            description: specialty.description,
            active: specialty.active,
          },
        }
      : {}),
    createdAt: resource.createdAt.toISOString(),
  };
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ensureVisible = (visibility: LibraryVisibility, userRole?: RoleName): void => {
  if (!allowedVisibilities(userRole).includes(visibility)) {
    throw new BibliotecaError(403, 'No tiene permisos para ver este recurso');
  }
};

const findResourceOrThrow = async (id: number): Promise<RecursoBiblioteca> => {
  const resource = await RecursoBiblioteca.findByPk(id);
  if (!resource) {
    throw new BibliotecaError(404, 'Recurso de biblioteca no encontrado');
  }
  return resource;
};

const getLibraryUploadPath = (storedPath: string): string => {
  const libraryDirectory = path.resolve(process.cwd(), 'uploads', 'library');
  const resolvedPath = path.resolve(process.cwd(), storedPath);
  const relativePath = path.relative(libraryDirectory, resolvedPath);

  if (
    relativePath === '' ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error('La ruta del archivo de biblioteca está fuera del directorio permitido.');
  }

  return resolvedPath;
};

export class BibliotecaService {
  async listarRecursos(
    userRole?: RoleName,
    filters: LibraryResourceFilters = {},
  ): Promise<LibraryResourceDTO[]> {
    const where: WhereOptions = {
      visibility: { [Op.in]: allowedVisibilities(userRole) },
    };

    if (filters.specialtyId !== undefined) {
      Object.assign(where, { specialtyId: filters.specialtyId });
    }
    if (filters.category) {
      Object.assign(where, { category: filters.category });
    }
    if (filters.search) {
      const searchPattern = `%${filters.search.trim()}%`;
      Object.assign(where, {
        [Op.or]: [
          { title: { [Op.like]: searchPattern } },
          { category: { [Op.like]: searchPattern } },
        ],
      });
    }

    const resources = await RecursoBiblioteca.findAll({
      where,
      include: [specialtyInclude],
      order: [['createdAt', 'DESC']],
    });

    return resources.map(toLibraryResourceDTO);
  }

  async obtenerPorId(id: number, userRole?: RoleName): Promise<LibraryResourceDTO> {
    const resource = await RecursoBiblioteca.findByPk(id, {
      include: [specialtyInclude],
    });
    if (!resource) {
      throw new BibliotecaError(404, 'Recurso de biblioteca no encontrado');
    }

    ensureVisible(resource.visibility, userRole);
    return toLibraryResourceDTO(resource);
  }

  async crearRecurso(
    data: CreateLibraryResourceRequest,
    file: Express.Multer.File,
    uploadedBy: number,
  ): Promise<LibraryResourceDTO> {
    const resource = await RecursoBiblioteca.create({
      title: data.title,
      category: data.category,
      file_path: path.relative(process.cwd(), file.path),
      file_size: formatFileSize(file.size),
      visibility: data.visibility,
      uploadedBy,
      specialtyId: data.specialtyId,
    });

    const createdResource = await RecursoBiblioteca.findByPk(resource.id, {
      include: [specialtyInclude],
    });

    if (!createdResource) {
      throw new Error('El recurso se creó pero no pudo recuperarse desde la base de datos.');
    }

    return toLibraryResourceDTO(createdResource);
  }

  async actualizarRecurso(
    id: number,
    data: UpdateLibraryResourceRequest,
  ): Promise<LibraryResourceDTO> {
    const resource = await findResourceOrThrow(id);
    await resource.update(data);

    const updatedResource = await RecursoBiblioteca.findByPk(id, {
      include: [specialtyInclude],
    });
    if (!updatedResource) {
      throw new Error('El recurso se actualizó pero no pudo recuperarse desde la base de datos.');
    }

    return toLibraryResourceDTO(updatedResource);
  }

  async eliminarRecurso(id: number): Promise<void> {
    const resource = await findResourceOrThrow(id);
    const filePath = getLibraryUploadPath(resource.file_path);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await resource.destroy();
  }
}
