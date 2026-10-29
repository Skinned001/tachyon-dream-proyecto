import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../auth/auth.dto.js';
import type {
  CreateLibraryResourceRequest,
  LibraryResourceDTO,
  UpdateLibraryResourceRequest,
} from './biblioteca.dto.js';
import { BibliotecaService } from './biblioteca.service.js';

const visibilitySchema = z.enum(['PUBLICO', 'INTERNO', 'CONFIDENCIAL']);

const createResourceSchema = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  visibility: visibilitySchema,
  specialtyId: z.coerce.number().int().positive(),
});

const updateResourceSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    visibility: visibilitySchema.optional(),
    specialtyId: z.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe especificar al menos un campo para actualizar',
  });

const getId = (value: string): number | undefined => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

const getQueryString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

export class BibliotecaController {
  constructor(private readonly bibliotecaService = new BibliotecaService()) {}

  listar = async (
    req: Request,
    res: Response<ApiResponse<LibraryResourceDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    const specialtyIdValue = getQueryString(req.query.specialtyId);
    const specialtyId = specialtyIdValue === undefined ? undefined : Number(specialtyIdValue);
    if (
      specialtyId !== undefined &&
      (!Number.isSafeInteger(specialtyId) || specialtyId < 1)
    ) {
      res.status(400).json({ success: false, error: 'specialtyId debe ser un entero positivo' });
      return;
    }

    const category = getQueryString(req.query.category);
    const search = getQueryString(req.query.search);
    const filters = {
      ...(specialtyId !== undefined ? { specialtyId } : {}),
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
    };

    try {
      const data = await this.bibliotecaService.listarRecursos(
        req.user?.role,
        filters,
      );
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  obtenerPorId = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<LibraryResourceDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    try {
      const data = await this.bibliotecaService.obtenerPorId(id, req.user?.role);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  crear = async (
    req: Request,
    res: Response<ApiResponse<LibraryResourceDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    console.log('Datos recibidos en req.body:', req.body);

    if (!req.user) {
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

    const requestBody =
      typeof req.body === 'object' && req.body !== null
        ? (req.body as Record<string, unknown>)
        : {};
    const normalizedBody = {
      ...requestBody,
      specialtyId: requestBody.specialtyId
        ? Number(requestBody.specialtyId)
        : undefined,
    };
    const parsedData = createResourceSchema.safeParse(normalizedBody);
    if (!parsedData.success) {
      console.error('Detalle del error de validación:', parsedData.error.issues);
      res.status(400).json({
        success: false,
        error: 'Los datos del recurso son inválidos',
      });
      return;
    }

    try {
      const data: CreateLibraryResourceRequest = parsedData.data;
      const resource = await this.bibliotecaService.crearRecurso(data, req.file, req.user.id);
      res.status(201).json({ success: true, data: resource });
    } catch (error: unknown) {
      next(error);
    }
  };

  actualizar = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<LibraryResourceDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    const parsedData = updateResourceSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ success: false, error: 'Los datos de actualización son inválidos' });
      return;
    }

    try {
      const data: UpdateLibraryResourceRequest = parsedData.data;
      const resource = await this.bibliotecaService.actualizarRecurso(id, data);
      res.status(200).json({ success: true, data: resource });
    } catch (error: unknown) {
      next(error);
    }
  };

  eliminar = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<{ message: string }>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    try {
      await this.bibliotecaService.eliminarRecurso(id);
      res.status(200).json({
        success: true,
        data: { message: 'Recurso eliminado correctamente' },
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}
