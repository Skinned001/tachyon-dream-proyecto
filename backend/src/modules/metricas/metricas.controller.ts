import { createHash } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../auth/auth.dto.js';
import {
  MetricasService,
  type MetricsOverviewDTO,
  type MetricsPeriod,
} from './metricas.service.js';

const trackSchema = z.object({
  eventType: z.enum(['VISIT', 'DOWNLOAD']),
  entityType: z.enum(['PORTAL', 'ARTICULO', 'RECURSO_BIBLIOTECA']),
  entityId: z.number().int().positive().nullable().optional(),
  specialtyId: z.number().int().positive().nullable().optional(),
  visitorHash: z.string().trim().min(8).max(64).optional(),
});

const periodSchema = z.enum(['30d', '90d', 'all']).default('30d');

const deriveVisitorHash = (req: Request): string => {
  const ip = req.ip ?? 'unknown';
  const userAgent = req.get('user-agent') ?? 'unknown';
  return createHash('sha256').update(`${ip}|${userAgent}`).digest('hex').slice(0, 32);
};

export class MetricasController {
  constructor(private readonly service = new MetricasService()) {}

  track = async (
    req: Request,
    res: Response<ApiResponse<{ tracked: boolean }>>,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = trackSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Los datos del evento de métrica no son válidos.',
      });
      return;
    }

    try {
      const tracked = await this.service.trackEvent({
        eventType: parsed.data.eventType,
        entityType: parsed.data.entityType,
        entityId: parsed.data.entityId ?? null,
        specialtyId: parsed.data.specialtyId ?? null,
        visitorHash: parsed.data.visitorHash ?? deriveVisitorHash(req),
      });
      res.status(tracked ? 201 : 200).json({ success: true, data: { tracked } });
    } catch (error: unknown) {
      next(error);
    }
  };

  overview = async (
    req: Request,
    res: Response<ApiResponse<MetricsOverviewDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const parsedPeriod = periodSchema.safeParse(req.query.period ?? '30d');
    if (!parsedPeriod.success) {
      res.status(400).json({
        success: false,
        error: 'El período solicitado no es válido (use 30d, 90d o all).',
      });
      return;
    }

    try {
      const data = await this.service.getOverview(
        parsedPeriod.data as MetricsPeriod,
      );
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };
}
