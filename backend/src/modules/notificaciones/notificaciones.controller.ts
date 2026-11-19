import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../auth/auth.dto.js';
import {
  NotificacionesService,
  type NotificacionDTO,
  type NotificacionesListDTO,
} from './notificaciones.service.js';

const preferenciasSchema = z.object({
  recibirNotificaciones: z.boolean(),
});

export class NotificacionesController {
  constructor(private readonly service = new NotificacionesService()) {}

  list = async (
    req: Request,
    res: Response<ApiResponse<NotificacionesListDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    try {
      const data = await this.service.findAll(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  markAsRead = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<NotificacionDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        error: 'El id debe ser un entero positivo',
      });
      return;
    }

    try {
      const notification = await this.service.markAsRead(req.user.id, id);
      res.status(200).json({ success: true, data: notification });
    } catch (error: unknown) {
      next(error);
    }
  }

  markAllAsRead = async (
    req: Request,
    res: Response<ApiResponse<{ updated: number }>>,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    try {
      const updated = await this.service.markAllAsRead(req.user.id);
      res.status(200).json({ success: true, data: { updated } });
    } catch (error: unknown) {
      next(error);
    }
  };

  updatePreferences = async (
    req: Request,
    res: Response<ApiResponse<{ recibirNotificaciones: boolean }>>,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    const parsed = preferenciasSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'recibirNotificaciones debe ser un booleano',
      });
      return;
    }

    try {
      const data = await this.service.updatePreferences(
        req.user.id,
        parsed.data.recibirNotificaciones,
      );
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };
}
