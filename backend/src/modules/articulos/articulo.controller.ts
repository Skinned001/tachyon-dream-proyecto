import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../auth/auth.dto.js';
import type { ArticleDTO, AuthenticatedArticleUser } from './articulo.dto.js';
import { ArticuloService } from './articulo.service.js';

const createArticleSchema = z
  .object({
    title: z.string().trim().min(1),
    abstract: z.string().trim().min(1),
    specialtyId: z.number().int().positive(),
  })
  .strip();

const updateArticleStateSchema = z.object({
  status: z.enum(['EN_REVISION', 'APROBADO', 'RECHAZADO', 'PUBLICADO']),
});

const getId = (value: string): number | undefined => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

const normalizeCreateBody = (body: unknown): unknown => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return body;
  }

  const requestBody = body as Record<string, unknown>;

  return {
    ...requestBody,
    specialtyId: Number(requestBody.specialtyId),
  };
};

const getAuthenticatedUser = (req: Request): AuthenticatedArticleUser | undefined => {
  if (!req.user) {
    return undefined;
  }
  return { id: req.user.id, role: req.user.role };
};

export class ArticuloController {
  constructor(private readonly articuloService = new ArticuloService()) {}

  crear = async (
    req: Request,
    res: Response<ApiResponse<ArticleDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'Debe adjuntar un archivo PDF en el campo file' });
      return;
    }

    const parsedData = createArticleSchema.safeParse(normalizeCreateBody(req.body));
    if (!parsedData.success) {
      console.error('Detalle del error de validación del artículo:', parsedData.error.issues);
      res.status(400).json({
        success: false,
        error: 'Los datos del artículo son inválidos',
      });
      return;
    }

    try {
      const data = await this.articuloService.crearArticulo(parsedData.data, req.file, user.id);
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  listar = async (
    req: Request,
    res: Response<ApiResponse<ArticleDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    try {
      const data = await this.articuloService.listarArticulos(user);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  actualizarEstado = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<ArticleDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    console.log('Body recibido en PUT /status:', req.body);

    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    const parsedData = updateArticleStateSchema.safeParse(req.body);
    if (!parsedData.success) {
      console.error('Motivo de validación inválida para el estado:', parsedData.error.issues);
      res.status(400).json({ success: false, error: 'El estado del artículo no es válido' });
      return;
    }

    try {
      const data = await this.articuloService.actualizarEstado(
        id,
        parsedData.data.status,
        user.id,
      );
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };
}
