import type { NextFunction, Request, Response } from 'express';
import { access, unlink } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { uploadsDirectory } from '../../config/uploads.js';
import { registrarAuditoria } from '../../services/auditoria.service.js';
import {
  sendActivationEmail,
  sendApprovalEmail,
  sendDeactivationEmail,
} from '../../utils/mailer.js';
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

  specialists = async (
    _req: Request,
    res: Response<ApiResponse>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.usuariosService.findReviewers();
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

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

      await registrarAuditoria({
        userId: req.user?.id ?? null,
        actorRole: req.user?.role ?? null,
        action: 'USUARIO_APROBADO',
        entityType: 'USUARIO',
        entityId: id,
        summary: `Aprobó la solicitud de registro de ${recipient.firstName} ${recipient.lastName} (${recipient.email}).`,
      });

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

      await registrarAuditoria({
        userId: req.user?.id ?? null,
        actorRole: req.user?.role ?? null,
        action: 'USUARIO_RECHAZADO',
        entityType: 'USUARIO',
        entityId: id,
        summary: `Rechazó y eliminó la solicitud de registro #${id}.`,
      });

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
      await registrarAuditoria({
        userId: req.user?.id ?? null,
        actorRole: req.user?.role ?? null,
        action: 'USUARIO_CREADO',
        entityType: 'USUARIO',
        entityId: created.user.id,
        summary: `Creó la cuenta de ${created.user.first_name} ${created.user.last_name} (${created.user.email}) con rol ${created.user.role}.`,
        details: {
          role: created.user.role,
          is_author: created.user.is_author,
        },
      });
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
      const { user, activated, deactivated } = await this.usuariosService.update(
        id,
        parsedBody.data,
        req.user.id,
      );
      let warning: string | undefined;
      if (activated || deactivated) {
        try {
          const fullName = `${user.first_name} ${user.last_name}`;
          if (activated) {
            await sendActivationEmail(user.email, fullName);
          } else {
            await sendDeactivationEmail(user.email, fullName);
          }
        } catch {
          warning = activated
            ? 'La cuenta fue habilitada, pero no se pudo enviar el correo. Verifica la configuración de correo.'
            : 'La cuenta fue deshabilitada, pero no se pudo enviar el correo. Verifica la configuración de correo.';
        }
      }
      await registrarAuditoria({
        userId: req.user.id,
        actorRole: req.user.role,
        action: 'USUARIO_EDITADO',
        entityType: 'USUARIO',
        entityId: user.id,
        summary: `Actualizó los datos/permisos del usuario ${user.first_name} ${user.last_name} (${user.email}).`,
        details: {
          role: user.role,
          active: user.active,
          is_author: user.is_author,
        },
      });
      res.status(200).json({
        success: true,
        data: { ...user, ...(warning ? { warning } : {}) },
      });
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
      const { user, deactivated } = await this.usuariosService.suspend(
        id,
        req.user.id,
      );
      let warning: string | undefined;
      if (deactivated) {
        try {
          await sendDeactivationEmail(
            user.email,
            `${user.first_name} ${user.last_name}`,
          );
        } catch {
          warning =
            'La cuenta fue deshabilitada, pero no se pudo enviar el correo. Verifica la configuración de correo.';
        }
      }
      await registrarAuditoria({
        userId: req.user.id,
        actorRole: req.user.role,
        action: 'USUARIO_SUSPENDIDO',
        entityType: 'USUARIO',
        entityId: id,
        summary: `Suspendió (baja lógica) al usuario #${id}.`,
      });
      res.status(200).json({
        success: true,
        data: warning ? { warning } : {},
      });
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
      await registrarAuditoria({
        userId: req.user?.id ?? null,
        actorRole: req.user?.role ?? null,
        action: 'USUARIO_PASSWORD_RESET',
        entityType: 'USUARIO',
        entityId: id,
        summary: `Restableció la contraseña temporal del usuario #${id}.`,
      });
      res.status(200).json({
        success: true,
        data: { temporaryPassword },
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}
