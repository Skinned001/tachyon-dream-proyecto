import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../auth/auth.dto.js';
import {
  NotificacionesService,
  type NotificacionDTO,
} from './notificaciones.service.js';

export class NotificacionesController {
  constructor(private readonly service = new NotificacionesService()) {}

  list = async (
    req: Request,
    res: Response<ApiResponse<NotificacionDTO[]>>,
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
      const notifications = await this.service.findAll(req.user.id);
      res.status(200).json({ success: true, data: notifications });
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
}
