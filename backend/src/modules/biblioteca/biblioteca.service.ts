import fs from 'node:fs';
import path from 'node:path';
import { Op, type WhereOptions } from 'sequelize';
import { uploadsDirectory } from '../../config/uploads.js';
import { Articulo } from '../articulos/Articulo.model.js';
import { ArticuloVersion } from '../articulos/ArticuloVersion.model.js';
import { Especialidad } from '../especialidades/Especialidad.model.js';
import type { RoleName } from '../auth/auth.dto.js';
import { Favorito, type FavoriteTargetType } from './Favorito.model.js';
import { RecursoBiblioteca } from './RecursoBiblioteca.model.js';
import type {
  CreateLibraryResourceRequest,
  FavoriteItemDTO,
  LibraryResourceDTO,
  LibraryResourceFilters,
  LibraryVisibility,
  ToggleFavoriteResultDTO,
  UpdateLibraryResourceRequest,
} from './biblioteca.dto.js';

const allowedVisibilities = (userRole?: RoleName): LibraryVisibility[] => {
  if (userRole === 'DDI' || userRole === 'COMITE' || userRole === 'ADMIN') {
    return ['PUBLICO', 'INTERNO', 'CONFIDENCIAL'];
  }
  if (userRole === 'STAFF' || userRole === 'EDITOR') {
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
    ...(resource.description !== null ? { description: resource.description } : {}),
    category: resource.category,
    file_path: resource.file_path,
    file_size: resource.file_size,
    ...(resource.fileUrl !== null ? { fileUrl: resource.fileUrl } : {}),
    ...(resource.fileName !== null ? { fileName: resource.fileName } : {}),
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

const backendRootDirectory = path.dirname(uploadsDirectory);

const getLibraryUploadPath = (storedPath: string): string => {
  const libraryDirectory = path.join(uploadsDirectory, 'library');
  const resolvedPath = path.resolve(backendRootDirectory, storedPath);
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
      file_path: path.relative(backendRootDirectory, file.path),
      file_size: formatFileSize(file.size),
      fileUrl: `/uploads/library/${path.basename(file.path)}`,
      fileName: file.originalname,
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

  async listarFavoritos(
    userId: number,
    userRole?: RoleName,
  ): Promise<FavoriteItemDTO[]> {
    const favorites = await Favorito.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    if (favorites.length === 0) {
      return [];
    }

    const articleIds = favorites
      .filter((item) => item.targetType === 'ARTICULO')
      .map((item) => item.targetId);
    const resourceIds = favorites
      .filter((item) => item.targetType === 'RECURSO')
      .map((item) => item.targetId);

    const [articles, resources] = await Promise.all([
      articleIds.length > 0
        ? Articulo.findAll({
            where: { id: { [Op.in]: articleIds }, state: 'PUBLICADO' },
            include: [
              specialtyInclude,
              {
                model: ArticuloVersion,
                as: 'versions',
                attributes: ['version_number', 'pdf_path'],
                where: { pdf_path: { [Op.ne]: null } },
                required: false,
                separate: true,
                order: [['version_number', 'DESC']],
              },
            ],
          })
        : Promise.resolve([]),
      resourceIds.length > 0
        ? RecursoBiblioteca.findAll({
            where: {
              id: { [Op.in]: resourceIds },
              visibility: { [Op.in]: allowedVisibilities(userRole) },
            },
            include: [specialtyInclude],
          })
        : Promise.resolve([]),
    ]);

    const articleMap = new Map(articles.map((article) => [article.id, article]));
    const resourceMap = new Map(resources.map((resource) => [resource.id, resource]));

    const result: FavoriteItemDTO[] = [];

    for (const fav of favorites) {
      if (fav.targetType === 'ARTICULO') {
        const article = articleMap.get(fav.targetId);
        if (!article) continue;
        const hasPdf = Boolean(article.versions?.[0]?.pdf_path);
        result.push({
          id: fav.id,
          targetType: 'ARTICULO',
          targetId: article.id,
          title: article.title,
          category: 'Artículo publicado',
          area: article.specialty?.name ?? '',
          fileUrl: hasPdf ? `/api/articulos/publicados/${article.id}/pdf?inline=1` : null,
          createdAt: fav.createdAt.toISOString(),
        });
      } else {
        const resource = resourceMap.get(fav.targetId);
        if (!resource) continue;
        const normalizedPath = resource.file_path
          .replace(/\\/g, '/')
          .replace(/^\/+/, '');
        result.push({
          id: fav.id,
          targetType: 'RECURSO',
          targetId: resource.id,
          title: resource.title,
          category: resource.category,
          area: resource.specialty?.name ?? '',
          fileUrl: resource.fileUrl ?? `/${normalizedPath}`,
          createdAt: fav.createdAt.toISOString(),
        });
      }
    }

    return result;
  }

  async toggleFavorito(
    userId: number,
    targetType: FavoriteTargetType,
    targetId: number,
    userRole?: RoleName,
  ): Promise<ToggleFavoriteResultDTO> {
    const existing = await Favorito.findOne({
      where: { userId, targetType, targetId },
    });

    if (existing) {
      await existing.destroy();
      return { saved: false, targetType, targetId };
    }

    if (targetType === 'ARTICULO') {
      const article = await Articulo.findOne({
        where: { id: targetId, state: 'PUBLICADO' },
        attributes: ['id'],
      });
      if (!article) {
        throw new BibliotecaError(
          404,
          'El artículo publicado no existe o ya no está disponible',
        );
      }
    } else {
      const resource = await RecursoBiblioteca.findByPk(targetId);
      if (!resource) {
        throw new BibliotecaError(404, 'Recurso de biblioteca no encontrado');
      }
      ensureVisible(resource.visibility, userRole);
    }

    await Favorito.create({ userId, targetType, targetId });
    return { saved: true, targetType, targetId };
  }
}
