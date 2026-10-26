import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { AuthUser, ApiResponse, LoginResponse } from './auth.dto.js';
import {
  changePasswordRequestSchema,
  loginRequestSchema,
} from './auth.dto.js';
import { AuthService } from './auth.service.js';

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
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
