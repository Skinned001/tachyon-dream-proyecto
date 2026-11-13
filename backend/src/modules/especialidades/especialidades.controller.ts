import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../auth/auth.dto.js';
import { Especialidad } from './Especialidad.model.js';

export class EspecialidadesController {
  list = async (
    _req: Request,
    res: Response<ApiResponse<Especialidad[]>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const especialidades = await Especialidad.findAll({
        where: { active: true },
        order: [['name', 'ASC']],
      });
      res.status(200).json({ success: true, data: especialidades });
    } catch (error: unknown) {
      next(error);
    }
  };
}
