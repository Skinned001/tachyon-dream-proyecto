import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../auth/auth.dto.js';
import {
  EspecialidadesService,
  type EspecialidadDTO,
} from './especialidades.service.js';

export class EspecialidadesController {
  constructor(
    private readonly especialidadesService = new EspecialidadesService(),
  ) {}

  list = async (
    _req: Request,
    res: Response<ApiResponse<EspecialidadDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.especialidadesService.findAll();
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };
}
