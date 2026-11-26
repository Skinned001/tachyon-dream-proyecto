import { unlink } from 'node:fs/promises';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { registrarAuditoria } from '../../services/auditoria.service.js';
import type { ApiResponse } from '../auth/auth.dto.js';
import {
  PortalError,
  PortalService,
  type PortalNovedadDTO,
  type PortalPublicContentDTO,
  type RevistaEdicionDTO,
} from './portal.service.js';

const parseBoolean = (fallback: boolean) =>
  z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') return fallback;
      if (typeof value === 'boolean') return value;
      return String(value).toLowerCase() === 'true' || value === '1';
    }, z.boolean())
    .default(fallback);

const createRevistaSchema = z.object({
  title: z.string().trim().min(1).max(255),
  editionLabel: z.string().trim().min(1).max(100),
  summary: z.string().trim().max(5000).optional(),
  publishedDate: z.coerce.date().optional(),
  isFeatured: parseBoolean(true),
  isPublished: parseBoolean(true),
});

const updateRevistaSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  editionLabel: z.string().trim().min(1).max(100).optional(),
  summary: z.string().trim().max(5000).nullable().optional(),
  publishedDate: z.coerce.date().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

const createNovedadSchema = z.object({
  title: z.string().trim().min(1).max(255),
  category: z
    .enum(['NOVEDAD', 'JORNADA', 'COMUNICADO', 'DESTACADO'])
    .default('NOVEDAD'),
  summary: z.string().trim().min(1).max(5000),
  externalLink: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine(
      (value) => !value || /^https?:\/\//i.test(value),
      'El enlace externo debe comenzar con http:// o https://',
    ),
  isPublished: parseBoolean(true),
  isPinned: parseBoolean(false),
});

const updateNovedadSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  category: z
    .enum(['NOVEDAD', 'JORNADA', 'COMUNICADO', 'DESTACADO'])
    .optional(),
  summary: z.string().trim().min(1).max(5000).optional(),
  externalLink: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .refine(
      (value) => !value || /^https?:\/\//i.test(value),
      'El enlace externo debe comenzar con http:// o https://',
    ),
  isPublished: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

const parseId = (raw: string): number | null => {
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const cleanupFiles = async (
  files: Express.Multer.File[],
): Promise<void> => {
  for (const file of files) {
    try {
      await unlink(file.path);
    } catch {
      // ignore cleanup errors
    }
  }
};

export class PortalController {
  constructor(private readonly service = new PortalService()) {}

  getPublic = async (
    _req: Request,
    res: Response<ApiResponse<PortalPublicContentDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getPublicContent();
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  listRevistas = async (
    _req: Request,
    res: Response<ApiResponse<RevistaEdicionDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.listRevistas();
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  createRevista = async (
    req: Request,
    res: Response<ApiResponse<RevistaEdicionDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const fileMap = (req.files ?? {}) as Record<string, Express.Multer.File[]>;
    const pdfFile = fileMap.pdf?.[0];
    const coverFile = fileMap.cover?.[0];
    const uploadedFiles = [pdfFile, coverFile].filter(
      (f): f is Express.Multer.File => Boolean(f),
    );

    if (!req.user) {
      await cleanupFiles(uploadedFiles);
      res.status(401).json({ success: false, error: 'Sesión expirada.' });
      return;
    }

    if (!pdfFile) {
      await cleanupFiles(uploadedFiles);
      res.status(400).json({
        success: false,
        error: 'Debe adjuntar el archivo PDF de la revista.',
      });
      return;
    }

    const parsed = createRevistaSchema.safeParse(req.body);
    if (!parsed.success) {
      await cleanupFiles(uploadedFiles);
      res.status(400).json({
        success: false,
        error: 'Título y número de edición son obligatorios.',
      });
      return;
    }

    try {
      const data = await this.service.createRevista({
        ...parsed.data,
        pdfFile,
        coverFile,
        createdBy: req.user.id,
      });
      await registrarAuditoria({
        userId: req.user.id,
        actorRole: req.user.role,
        action: 'REVISTA_CREADA',
        entityType: 'REVISTA',
        entityId: data.id,
        summary: `Publicó la edición "${data.title}" (${data.editionLabel}).`,
        details: { editionLabel: data.editionLabel, isFeatured: data.isFeatured },
      });
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      await cleanupFiles(uploadedFiles);
      if (error instanceof PortalError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };

  updateRevista = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<RevistaEdicionDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'ID inválido.' });
      return;
    }
    const parsed = updateRevistaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Datos inválidos.' });
      return;
    }

    try {
      const data = await this.service.updateRevista(id, parsed.data);
      if (req.user) {
        await registrarAuditoria({
          userId: req.user.id,
          actorRole: req.user.role,
          action: 'REVISTA_ACTUALIZADA',
          entityType: 'REVISTA',
          entityId: data.id,
          summary: `Actualizó la edición "${data.title}" (${data.editionLabel}).`,
          details: { isFeatured: data.isFeatured, isPublished: data.isPublished },
        });
      }
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      if (error instanceof PortalError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };

  deleteRevista = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<{ message: string }>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'ID inválido.' });
      return;
    }
    try {
      const removed = await this.service.deleteRevista(id);
      if (req.user) {
        await registrarAuditoria({
          userId: req.user.id,
          actorRole: req.user.role,
          action: 'REVISTA_ELIMINADA',
          entityType: 'REVISTA',
          entityId: removed.id,
          summary: `Eliminó la edición "${removed.title}" (${removed.editionLabel}).`,
        });
      }
      res.status(200).json({
        success: true,
        data: { message: 'Edición eliminada correctamente.' },
      });
    } catch (error: unknown) {
      if (error instanceof PortalError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };

  listNovedades = async (
    _req: Request,
    res: Response<ApiResponse<PortalNovedadDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.listNovedades();
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  createNovedad = async (
    req: Request,
    res: Response<ApiResponse<PortalNovedadDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const fileMap = (req.files ?? {}) as Record<string, Express.Multer.File[]>;
    const imageFile = fileMap.image?.[0];
    const attachmentFile = fileMap.attachment?.[0];
    const uploadedFiles = [imageFile, attachmentFile].filter(
      (f): f is Express.Multer.File => Boolean(f),
    );

    if (!req.user) {
      await cleanupFiles(uploadedFiles);
      res.status(401).json({ success: false, error: 'Sesión expirada.' });
      return;
    }

    const parsed = createNovedadSchema.safeParse(req.body);
    if (!parsed.success) {
      await cleanupFiles(uploadedFiles);
      res.status(400).json({
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          'Título y contenido son obligatorios.',
      });
      return;
    }

    try {
      const data = await this.service.createNovedad({
        ...parsed.data,
        imageFile,
        attachmentFile,
        createdBy: req.user.id,
      });
      await registrarAuditoria({
        userId: req.user.id,
        actorRole: req.user.role,
        action: 'NOVEDAD_PORTAL_CREADA',
        entityType: 'PORTAL_NOVEDAD',
        entityId: data.id,
        summary: `Creó la publicación de portada "${data.title}" (${data.category}).`,
        details: { category: data.category, isPublished: data.isPublished },
      });
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      await cleanupFiles(uploadedFiles);
      if (error instanceof PortalError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };

  updateNovedad = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<PortalNovedadDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'ID inválido.' });
      return;
    }
    const parsed = updateNovedadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
      });
      return;
    }

    try {
      const data = await this.service.updateNovedad(id, parsed.data);
      if (req.user) {
        await registrarAuditoria({
          userId: req.user.id,
          actorRole: req.user.role,
          action: 'NOVEDAD_PORTAL_ACTUALIZADA',
          entityType: 'PORTAL_NOVEDAD',
          entityId: data.id,
          summary: `Actualizó la publicación de portada "${data.title}".`,
          details: { isPublished: data.isPublished, isPinned: data.isPinned },
        });
      }
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      if (error instanceof PortalError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };

  deleteNovedad = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<{ message: string }>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'ID inválido.' });
      return;
    }
    try {
      const removed = await this.service.deleteNovedad(id);
      if (req.user) {
        await registrarAuditoria({
          userId: req.user.id,
          actorRole: req.user.role,
          action: 'NOVEDAD_PORTAL_ELIMINADA',
          entityType: 'PORTAL_NOVEDAD',
          entityId: removed.id,
          summary: `Eliminó la publicación de portada "${removed.title}".`,
        });
      }
      res.status(200).json({
        success: true,
        data: { message: 'Publicación eliminada correctamente.' },
      });
    } catch (error: unknown) {
      if (error instanceof PortalError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };
}
