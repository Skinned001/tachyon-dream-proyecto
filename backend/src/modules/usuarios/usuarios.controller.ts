import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../auth/auth.dto.js';
import { UsuariosService } from './usuarios.service.js';

const createUsuarioSchema = z.object({
  username: z.string().trim().min(1).max(255),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  first_name: z.string().trim().min(1).max(255),
  last_name: z.string().trim().min(1).max(255),
  dni: z.string().trim().min(1).max(255),
  role: z.enum(['STAFF', 'DDI', 'COMITE', 'EDITOR', 'ADMIN']),
  is_author: z.boolean().optional().default(false),
  is_guest: z.boolean().optional().default(false),
  specialtyId: z.number().int().positive().nullable().optional(),
});

const updateUsuarioSchema = z
  .object({
    username: z.string().trim().min(1).max(255).optional(),
    email: z.string().trim().email().transform((email) => email.toLowerCase()).optional(),
    first_name: z.string().trim().min(1).max(255).optional(),
    last_name: z.string().trim().min(1).max(255).optional(),
    dni: z.string().trim().min(1).max(255).optional(),
    role: z.enum(['STAFF', 'DDI', 'COMITE', 'EDITOR', 'ADMIN']).optional(),
    is_author: z.boolean().optional(),
    is_guest: z.boolean().optional(),
    specialtyId: z.number().int().positive().nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe proporcionar al menos un campo para actualizar',
  });

const getId = (value: string): number | undefined => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

export class UsuariosController {
  constructor(private readonly usuariosService = new UsuariosService()) {}

  list = async (
    _req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const items = await this.usuariosService.findAll();
      res.status(200).json({
        success: true,
        data: { items, total: items.length, page: 1, limit: items.length },
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ): Promise<void> => {
    const parsedBody = createUsuarioSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        error: 'Los datos del usuario son inválidos; nombre, correo, DNI y rol son obligatorios',
      });
      return;
    }

    try {
      const created = await this.usuariosService.create(parsedBody.data);
      res.status(201).json({
        success: true,
        data: {
          ...created.user,
          temporaryPassword: created.temporaryPassword,
        },
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  update = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
    next: NextFunction,
  ): Promise<void> => {
    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'El id debe ser un entero positivo',
      });
      return;
    }

    const parsedBody = updateUsuarioSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        error: 'Los datos del usuario son inválidos',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    try {
      const usuario = await this.usuariosService.update(
        id,
        parsedBody.data,
        req.user.id,
      );
      res.status(200).json({ success: true, data: usuario });
    } catch (error: unknown) {
      next(error);
    }
  };

  delete = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
    next: NextFunction,
  ): Promise<void> => {
    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'El id debe ser un entero positivo',
      });
      return;
    }
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    try {
      await this.usuariosService.suspend(id, req.user.id);
      res.status(200).json({ success: true, data: {} });
    } catch (error: unknown) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
    next: NextFunction,
  ): Promise<void> => {
    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'El id debe ser un entero positivo',
      });
      return;
    }

    try {
      const { temporaryPassword } = await this.usuariosService.resetPassword(id);
      res.status(200).json({
        success: true,
        data: { temporaryPassword },
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}
