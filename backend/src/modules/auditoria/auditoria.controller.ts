import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../auth/auth.dto.js';
import {
  AuditoriaService,
  type PaginatedAuditLogsDTO,
} from './auditoria.service.js';

const querySchema = z.object({
  entityType: z
    .enum(['ARTICULO', 'CONVOCATORIA', 'USUARIO', 'RECURSO_BIBLIOTECA'])
    .optional(),
  action: z.string().trim().min(1).max(80).optional(),
  search: z.string().trim().min(1).max(200).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export class AuditoriaController {
  constructor(private readonly service = new AuditoriaService()) {}

  listar = async (
    req: Request,
    res: Response<ApiResponse<PaginatedAuditLogsDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const rawQuery = Object.fromEntries(
      Object.entries(req.query).filter(
        ([, value]) => value !== '' && value !== undefined,
      ),
    );
    const parsed = querySchema.safeParse(rawQuery);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Los parámetros de filtro de auditoría no son válidos.',
      });
      return;
    }

    try {
      const data = await this.service.listar(parsed.data);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };
}
