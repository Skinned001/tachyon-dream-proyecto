import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../auth/auth.dto.js';
import { Especialidad } from './Especialidad.model.js';

const createEspecialidadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional(),
});

const updateEspecialidadSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(5000).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar',
  });

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

  listAll = async (
    _req: Request,
    res: Response<ApiResponse<Especialidad[]>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const especialidades = await Especialidad.findAll({
        order: [['name', 'ASC']],
      });
      res.status(200).json({ success: true, data: especialidades });
    } catch (error: unknown) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response<ApiResponse<Especialidad>>,
    next: NextFunction,
  ): Promise<void> => {
    const parsedBody = createEspecialidadSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        error: 'El nombre es obligatorio y los datos deben ser válidos',
      });
      return;
    }

    try {
      const especialidad = await Especialidad.create({
        name: parsedBody.data.name,
        description: parsedBody.data.description ?? '',
        active: true,
      });
      res.status(201).json({ success: true, data: especialidad });
    } catch (error: unknown) {
      next(error);
    }
  };

  update = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<Especialidad>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        error: 'El id debe ser un entero positivo',
      });
      return;
    }

    const parsedBody = updateEspecialidadSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        error: 'Los datos de la especialidad son inválidos',
      });
      return;
    }

    try {
      const especialidad = await Especialidad.findByPk(id);
      if (!especialidad) {
        res.status(404).json({
          success: false,
          error: 'Especialidad no encontrada',
        });
        return;
      }

      await especialidad.update(parsedBody.data);
      res.status(200).json({ success: true, data: especialidad });
    } catch (error: unknown) {
      next(error);
    }
  };
}
