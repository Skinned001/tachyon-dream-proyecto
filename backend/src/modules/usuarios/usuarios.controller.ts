import type { NextFunction, Request, Response } from 'express';
import { access, unlink } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { sendApprovalEmail } from '../../config/email.js';
import { uploadsDirectory } from '../../config/uploads.js';
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

const isMissingFileError = (error: unknown): boolean =>
  error instanceof Error &&
  'code' in error &&
  error.code === 'ENOENT';

export class UsuariosController {
  constructor(private readonly usuariosService = new UsuariosService()) {}

  list = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ): Promise<void> => {
    if (req.query.estado !== undefined && req.query.estado !== 'PENDIENTE') {
      res.status(400).json({
        success: false,
        error: 'El estado solicitado no es válido',
      });
      return;
    }

    try {
      const items =
        req.query.estado === 'PENDIENTE'
          ? await this.usuariosService.findPendingRegistrations()
          : await this.usuariosService.findAll();
      res.status(200).json({
        success: true,
        data: { items, total: items.length, page: 1, limit: items.length },
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  credential = async (
    req: Request<{ id: string }>,
    res: Response,
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
      const filename = await this.usuariosService.findCredentialFilename(id);
      if (!filename || !/^[0-9a-f-]+\.(pdf|jpg|png)$/i.test(filename)) {
        res.status(404).json({
          success: false,
          error: 'No se encontró la credencial solicitada',
        });
        return;
      }

      const credentialPath = path.join(
        uploadsDirectory,
        'credentials',
        path.basename(filename),
      );
      try {
        await access(credentialPath);
      } catch (error: unknown) {
        if (isMissingFileError(error)) {
          res.status(404).json({
            success: false,
            error: 'No se encontró el archivo de credencial',
          });
          return;
        }
        throw error;
      }

      res.sendFile(
        credentialPath,
        { headers: { 'Content-Disposition': 'inline' } },
        (error) => {
          if (error) next(error);
        },
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  approve = async (
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
      const recipient = await this.usuariosService.approvePendingRegistration(id);
      let emailSent = true;
      let warning: string | undefined;
      try {
        await sendApprovalEmail(recipient);
      } catch (error: unknown) {
        emailSent = false;
        warning =
          'La cuenta fue aprobada, pero no se pudo enviar el correo. Verifica la configuración SMTP.';
        console.error('No se pudo enviar el correo de aprobación:', error);
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Usuario aprobado',
          emailSent,
          ...(warning ? { warning } : {}),
        },
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  reject = async (
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
      const filename = await this.usuariosService.rejectPendingRegistration(id);
      let warning: string | undefined;
      if (filename && /^[0-9a-f-]+\.(pdf|jpg|png)$/i.test(filename)) {
        try {
          await unlink(
            path.join(
              uploadsDirectory,
              'credentials',
              path.basename(filename),
            ),
          );
        } catch (error: unknown) {
          warning = 'La solicitud se rechazó, pero no se pudo eliminar su archivo.';
          console.error('No se pudo eliminar la credencial rechazada:', error);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Solicitud rechazada',
          ...(warning ? { warning } : {}),
        },
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
      const user = await this.usuariosService.update(
        id,
        parsedBody.data,
        req.user.id,
      );
      res.status(200).json({ success: true, data: user });
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
