import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { unlink } from 'node:fs/promises';
import { z } from 'zod';
import type { AuthUser, ApiResponse, LoginResponse } from './auth.dto.js';
import {
  changePasswordRequestSchema,
  loginRequestSchema,
} from './auth.dto.js';
import { AuthService, type UpdateProfileData } from './auth.service.js';

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const updateProfileSchema = z
  .object({
    first_name: z.string().trim().min(1).max(255).optional(),
    last_name: z.string().trim().min(1).max(255).optional(),
    username: z.string().trim().min(1).max(255).optional(),
    profile_image: z.string().trim().max(255).nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe proporcionar al menos un campo para actualizar',
  });

const removeUploadedProfileImage = async (
  file: Express.Multer.File | undefined,
): Promise<void> => {
  if (file) {
    await unlink(file.path);
  }
};

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  login = async (
    req: Request<ParamsDictionary, ApiResponse<LoginResponse>, unknown>,
    res: Response<ApiResponse<LoginResponse>>,
    next: NextFunction,
  ): Promise<void> => {
    const parsedBody = loginRequestSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ success: false, error: 'Debe ingresar un correo y una contraseña válidos' });
      return;
    }

    try {
      const data = await this.authService.login(parsedBody.data.email, parsedBody.data.password);
      res.cookie('token', data.token, {
        ...sessionCookieOptions,
        maxAge: SESSION_MAX_AGE_MS,
      });
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  logout = (
    _req: Request,
    res: Response<ApiResponse<{ message: string }>>,
  ): void => {
    res.clearCookie('token', sessionCookieOptions);
    res.status(200).json({ success: true, data: { message: 'Sesión cerrada' } });
  };

  me = async (
    req: Request,
    res: Response<ApiResponse<AuthUser>>,
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
      const data = await this.authService.getCurrentUser(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  verify = (
    req: Request,
    res: Response<ApiResponse<{ valid: true }>>,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    res.status(200).json({ success: true, data: { valid: true } });
  };

  updateProfile = async (
    req: Request<ParamsDictionary, ApiResponse<AuthUser>, UpdateProfileData>,
    res: Response<ApiResponse<AuthUser>>,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    const requestBody = {
      ...req.body,
      ...(req.file
        ? { profile_image: `/uploads/profiles/${req.file.filename}` }
        : {}),
    };
    const parsedBody = updateProfileSchema.safeParse(requestBody);
    if (!parsedBody.success) {
      try {
        await removeUploadedProfileImage(req.file);
      } catch (error: unknown) {
        next(error);
        return;
      }
      res.status(400).json({
        success: false,
        error: 'Los datos del perfil son inválidos',
      });
      return;
    }

    try {
      const data = await this.authService.updateProfile(
        req.user.id,
        parsedBody.data,
      );
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      try {
        await removeUploadedProfileImage(req.file);
      } catch (cleanupError: unknown) {
        console.error('No se pudo limpiar la foto tras fallar la actualización del perfil:', cleanupError);
      }
      next(error);
    }
  };

  changePassword = async (
    req: Request<ParamsDictionary, ApiResponse<{ message: string }>, unknown>,
    res: Response<ApiResponse<{ message: string }>>,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    const parsedBody = changePasswordRequestSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        error: 'Debe ingresar la contraseña actual y la nueva contraseña',
      });
      return;
    }

    try {
      await this.authService.changePassword(
        req.user.id,
        parsedBody.data.currentPassword,
        parsedBody.data.newPassword,
      );
      res.status(200).json({
        success: true,
        data: { message: 'Contraseña actualizada correctamente' },
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}
