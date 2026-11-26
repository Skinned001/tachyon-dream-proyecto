import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { Op } from 'sequelize';
import { portalUploadsDirectory } from './portal.upload.js';
import {
  PortalNovedad,
  type PortalNovedadCategory,
} from './PortalNovedad.model.js';
import { RevistaEdicion } from './RevistaEdicion.model.js';

export interface RevistaEdicionDTO {
  id: number;
  title: string;
  editionLabel: string;
  summary: string | null;
  coverImageUrl: string | null;
  pdfUrl: string;
  pdfFileName: string | null;
  publishedDate: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface PortalNovedadDTO {
  id: number;
  title: string;
  category: PortalNovedadCategory;
  summary: string;
  imageUrl: string | null;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
  externalLink: string | null;
  isPublished: boolean;
  isPinned: boolean;
  createdAt: string;
}

export interface PortalPublicContentDTO {
  featuredEdition: RevistaEdicionDTO | null;
  pastEditions: RevistaEdicionDTO[];
  news: PortalNovedadDTO[];
}

const toRevistaDTO = (row: RevistaEdicion): RevistaEdicionDTO => ({
  id: row.id,
  title: row.title,
  editionLabel: row.editionLabel,
  summary: row.summary,
  coverImageUrl: row.coverImageUrl,
  pdfUrl: row.pdfUrl,
  pdfFileName: row.pdfFileName,
  publishedDate: row.publishedDate.toISOString(),
  isFeatured: row.isFeatured,
  isPublished: row.isPublished,
  createdAt: row.createdAt.toISOString(),
});

const toNovedadDTO = (row: PortalNovedad): PortalNovedadDTO => ({
  id: row.id,
  title: row.title,
  category: row.category,
  summary: row.summary,
  imageUrl: row.imageUrl,
  attachmentUrl: row.attachmentUrl,
  attachmentFileName: row.attachmentFileName,
  externalLink: row.externalLink,
  isPublished: row.isPublished,
  isPinned: row.isPinned,
  createdAt: row.createdAt.toISOString(),
});

const removePortalFileByUrl = async (url: string | null): Promise<void> => {
  if (!url || !url.startsWith('/uploads/portal/')) return;
  const fileName = path.basename(url);
  const fullPath = path.resolve(portalUploadsDirectory, fileName);
  if (path.dirname(fullPath) !== portalUploadsDirectory) return;
  try {
    await unlink(fullPath);
  } catch (error: unknown) {
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      error.code !== 'ENOENT'
    ) {
      throw error;
    }
  }
};

export class PortalError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'PortalError';
  }
}

export class PortalService {
  async getPublicContent(): Promise<PortalPublicContentDTO> {
    const [editions, news] = await Promise.all([
      RevistaEdicion.findAll({
        where: { isPublished: true },
        order: [
          ['isFeatured', 'DESC'],
          ['publishedDate', 'DESC'],
          ['id', 'DESC'],
        ],
      }),
      PortalNovedad.findAll({
        where: { isPublished: true },
        order: [
          ['isPinned', 'DESC'],
          ['createdAt', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: 12,
      }),
    ]);

    const mappedEditions = editions.map(toRevistaDTO);
    const featuredEdition = mappedEditions[0] ?? null;
    const pastEditions = mappedEditions.slice(1);

    return {
      featuredEdition,
      pastEditions,
      news: news.map(toNovedadDTO),
    };
  }

  async listRevistas(): Promise<RevistaEdicionDTO[]> {
    const rows = await RevistaEdicion.findAll({
      order: [
        ['isFeatured', 'DESC'],
        ['publishedDate', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return rows.map(toRevistaDTO);
  }

  async createRevista(input: {
    title: string;
    editionLabel: string;
    summary?: string | null;
    publishedDate?: Date;
    isFeatured: boolean;
    isPublished: boolean;
    pdfFile: Express.Multer.File;
    coverFile?: Express.Multer.File;
    createdBy: number;
  }): Promise<RevistaEdicionDTO> {
    if (input.isFeatured) {
      await RevistaEdicion.update(
        { isFeatured: false },
        { where: { isFeatured: true } },
      );
    }

    const row = await RevistaEdicion.create({
      title: input.title,
      editionLabel: input.editionLabel,
      summary: input.summary?.trim() || null,
      coverImageUrl: input.coverFile
        ? `/uploads/portal/${path.basename(input.coverFile.path)}`
        : null,
      pdfUrl: `/uploads/portal/${path.basename(input.pdfFile.path)}`,
      pdfFileName: input.pdfFile.originalname,
      publishedDate: input.publishedDate ?? new Date(),
      isFeatured: input.isFeatured,
      isPublished: input.isPublished,
      createdBy: input.createdBy,
    });
    return toRevistaDTO(row);
  }

  async updateRevista(
    id: number,
    input: {
      title?: string;
      editionLabel?: string;
      summary?: string | null;
      publishedDate?: Date;
      isFeatured?: boolean;
      isPublished?: boolean;
    },
  ): Promise<RevistaEdicionDTO> {
    const row = await RevistaEdicion.findByPk(id);
    if (!row) {
      throw new PortalError(404, 'Edición de revista no encontrada.');
    }

    if (input.isFeatured) {
      await RevistaEdicion.update(
        { isFeatured: false },
        { where: { id: { [Op.ne]: id } } },
      );
    }

    await row.update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.editionLabel !== undefined
        ? { editionLabel: input.editionLabel }
        : {}),
      ...(input.summary !== undefined
        ? { summary: input.summary?.trim() || null }
        : {}),
      ...(input.publishedDate !== undefined
        ? { publishedDate: input.publishedDate }
        : {}),
      ...(input.isFeatured !== undefined
        ? { isFeatured: input.isFeatured }
        : {}),
      ...(input.isPublished !== undefined
        ? { isPublished: input.isPublished }
        : {}),
    });

    return toRevistaDTO(row);
  }

  async deleteRevista(id: number): Promise<RevistaEdicionDTO> {
    const row = await RevistaEdicion.findByPk(id);
    if (!row) {
      throw new PortalError(404, 'Edición de revista no encontrada.');
    }
    const dto = toRevistaDTO(row);
    await removePortalFileByUrl(row.pdfUrl);
    await removePortalFileByUrl(row.coverImageUrl);
    await row.destroy();
    return dto;
  }

  async listNovedades(): Promise<PortalNovedadDTO[]> {
    const rows = await PortalNovedad.findAll({
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return rows.map(toNovedadDTO);
  }

  async createNovedad(input: {
    title: string;
    category: PortalNovedadCategory;
    summary: string;
    externalLink?: string | null;
    isPublished: boolean;
    isPinned: boolean;
    imageFile?: Express.Multer.File;
    attachmentFile?: Express.Multer.File;
    createdBy: number;
  }): Promise<PortalNovedadDTO> {
    const row = await PortalNovedad.create({
      title: input.title,
      category: input.category,
      summary: input.summary,
      imageUrl: input.imageFile
        ? `/uploads/portal/${path.basename(input.imageFile.path)}`
        : null,
      attachmentUrl: input.attachmentFile
        ? `/uploads/portal/${path.basename(input.attachmentFile.path)}`
        : null,
      attachmentFileName: input.attachmentFile?.originalname ?? null,
      externalLink: input.externalLink?.trim() || null,
      isPublished: input.isPublished,
      isPinned: input.isPinned,
      createdBy: input.createdBy,
    });
    return toNovedadDTO(row);
  }

  async updateNovedad(
    id: number,
    input: {
      title?: string;
      category?: PortalNovedadCategory;
      summary?: string;
      externalLink?: string | null;
      isPublished?: boolean;
      isPinned?: boolean;
    },
  ): Promise<PortalNovedadDTO> {
    const row = await PortalNovedad.findByPk(id);
    if (!row) {
      throw new PortalError(404, 'Publicación de portada no encontrada.');
    }
    await row.update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.externalLink !== undefined
        ? { externalLink: input.externalLink?.trim() || null }
        : {}),
      ...(input.isPublished !== undefined
        ? { isPublished: input.isPublished }
        : {}),
      ...(input.isPinned !== undefined ? { isPinned: input.isPinned } : {}),
    });
    return toNovedadDTO(row);
  }

  async deleteNovedad(id: number): Promise<PortalNovedadDTO> {
    const row = await PortalNovedad.findByPk(id);
    if (!row) {
      throw new PortalError(404, 'Publicación de portada no encontrada.');
    }
    const dto = toNovedadDTO(row);
    await removePortalFileByUrl(row.imageUrl);
    await removePortalFileByUrl(row.attachmentUrl);
    await row.destroy();
    return dto;
  }
}
