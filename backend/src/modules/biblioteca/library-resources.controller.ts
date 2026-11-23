import { unlink } from 'node:fs/promises';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../auth/auth.dto.js';
import { registrarAuditoria } from '../../services/auditoria.service.js';
import type { InstitutionalLibraryResourceDTO } from './library-resources.dto.js';
import { LibraryResourcesService } from './library-resources.service.js';

const createSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional(),
  category: z.string().trim().min(1).max(64),
});

const listQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).max(200).optional(),
});

const parseId = (value: string): number | undefined => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

const removeUploadedFile = async (file: Express.Multer.File): Promise<void> => {
  try {
    await unlink(file.path);
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

export class LibraryResourcesController {
  constructor(private readonly service = new LibraryResourcesService()) {}

  list = async (
    req: Request,
    res: Response<ApiResponse<InstitutionalLibraryResourceDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    const parsedQuery = listQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(400).json({
        success: false,
        error: 'Los filtros category y search deben ser textos válidos.',
      });
      return;
    }

    try {
      const data = await this.service.list(parsedQuery.data);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response<ApiResponse<InstitutionalLibraryResourceDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente.',
      });
      return;
    }
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Debe adjuntar un archivo PDF en el campo file.',
      });
      return;
    }

    const parsedBody = createSchema.safeParse(req.body);
    if (!parsedBody.success) {
      try {
        await removeUploadedFile(req.file);
      } catch (error: unknown) {
        next(error);
        return;
      }
      res.status(400).json({
        success: false,
        error: 'title y category son obligatorios; description es opcional.',
      });
      return;
    }

    try {
      const data = await this.service.create(
        parsedBody.data,
        req.file,
        req.user.id,
      );
      await registrarAuditoria({
        userId: req.user.id,
        actorRole: req.user.role,
        action: 'RECURSO_BIBLIOTECA_CREADO',
        entityType: 'RECURSO_BIBLIOTECA',
        entityId: data.id,
        summary: `Cargó el documento institucional "${data.title}" (${data.category}).`,
        details: { category: data.category, fileName: data.fileName },
      });
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      try {
        await removeUploadedFile(req.file);
      } catch (cleanupError: unknown) {
        next(cleanupError);
        return;
      }
      next(error);
    }
  };

  delete = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<{ message: string }>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'El id debe ser un entero positivo.',
      });
      return;
    }

    try {
      await this.service.delete(id);
      await registrarAuditoria({
        userId: req.user?.id ?? null,
        actorRole: req.user?.role ?? null,
        action: 'RECURSO_BIBLIOTECA_ELIMINADO',
        entityType: 'RECURSO_BIBLIOTECA',
        entityId: id,
        summary: `Eliminó el documento institucional #${id} de Biblioteca.`,
      });
      res.status(200).json({
        success: true,
        data: { message: 'Recurso de Biblioteca eliminado correctamente.' },
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}
