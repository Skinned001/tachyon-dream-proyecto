import type { NextFunction, Request, Response } from "express";
import { registrarAuditoria } from "../../services/auditoria.service.js";
import type { ApiResponse } from "../auth/auth.dto.js";
import {
  EspecialidadesService,
  type EspecialidadDTO,
} from "./especialidades.service.js";

export class EspecialidadesController {
  constructor(
    private readonly especialidadesService = new EspecialidadesService(),
  ) {}

  list = async (
    req: Request,
    res: Response<ApiResponse<EspecialidadDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.especialidadesService.findAll(
        req.user?.role === 'ADMIN',
      );
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response<ApiResponse<EspecialidadDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const body = req.body ?? {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body.description === 'string' ? body.description.trim() : '';

    if (!name) {
      res.status(400).json({
        success: false,
        error: 'El nombre es obligatorio',
      });
      return;
    }

    if (
      body.description !== undefined &&
      typeof body.description !== 'string'
    ) {
      res.status(400).json({
        success: false,
        error: 'La descripción debe ser texto',
      });
      return;
    }

    try {
      const data = await this.especialidadesService.create({
        name,
        description,
      });
      await registrarAuditoria({
        userId: req.user?.id ?? null,
        actorRole: req.user?.role ?? null,
        action: 'ESPECIALIDAD_CREADA',
        entityType: 'ESPECIALIDAD',
        entityId: data.id,
        summary: `Creó la especialidad "${data.name}".`,
        details: {
          description: data.description,
          active: data.active,
        },
      });
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  update = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<EspecialidadDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({
        success: false,
        error: 'El identificador de especialidad no es válido',
      });
      return;
    }

    const body = req.body ?? {};
    const updates: {
      name?: string;
      description?: string;
      active?: boolean;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        res.status(400).json({
          success: false,
          error: 'El nombre no puede estar vacío',
        });
        return;
      }
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        res.status(400).json({
          success: false,
          error: 'La descripción debe ser texto',
        });
        return;
      }
      updates.description = body.description.trim();
    }

    if (body.active !== undefined) {
      if (typeof body.active !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'El estado debe ser verdadero o falso',
        });
        return;
      }
      updates.active = body.active;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        error: 'Debe indicar al menos un campo para actualizar',
      });
      return;
    }

    try {
      const data = await this.especialidadesService.update(id, updates);
      if (!data) {
        res.status(404).json({
          success: false,
          error: 'Especialidad no encontrada',
        });
        return;
      }
      await registrarAuditoria({
        userId: req.user?.id ?? null,
        actorRole: req.user?.role ?? null,
        action: 'ESPECIALIDAD_EDITADA',
        entityType: 'ESPECIALIDAD',
        entityId: data.id,
        summary: `Actualizó la especialidad "${data.name}" (${data.active ? 'Activa' : 'Inactiva'}).`,
        details: {
          ...updates,
          active: data.active,
        },
      });
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };
}
