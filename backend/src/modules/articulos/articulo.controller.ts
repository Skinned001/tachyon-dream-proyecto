import { unlink } from 'node:fs/promises';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../auth/auth.dto.js';
import type {
  ArticleDTO,
  AuthenticatedArticleUser,
  PublishedArticleDTO,
  ReviewerCandidateDTO,
} from './articulo.dto.js';
import { ArticuloService } from './articulo.service.js';

const parseCoauthors = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean);
        }
      } catch {
        // Fallback to comma-separated list below.
      }
    }
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return undefined;
};

const createArticleSchema = z
  .object({
    title: z.string().trim().min(1),
    abstract: z.string().trim().min(1).optional(),
    summary: z.string().trim().min(1).optional(),
    specialtyId: z.number().int().positive(),
    convocatoriaId: z.number().int().positive(),
    coauthors: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
  })
  .transform((data) => ({
    title: data.title,
    abstract: data.abstract ?? data.summary ?? '',
    specialtyId: data.specialtyId,
    convocatoriaId: data.convocatoriaId,
    ...(data.coauthors !== undefined ? { coauthors: data.coauthors } : {}),
  }))
  .refine((data) => data.abstract.length > 0, {
    message: 'Debe enviar abstract o summary',
  });

const createVersionSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  abstract: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(5000).optional(),
  coauthors: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
});

const deskRejectSchema = z.object({
  reason: z.string().trim().min(5, 'Debe indicar un motivo de al menos 5 caracteres').max(5000),
});

const assignReviewersSchema = z.object({
  reviewerIds: z
    .array(z.number().int().positive())
    .refine((ids) => {
      const uniqueCount = new Set(ids).size;
      return uniqueCount === 1 || uniqueCount === 3;
    }, 'Debe asignar exactamente 1 o 3 revisores distintos del Comité'),
});

const submitVerdictSchema = z.object({
  verdict: z.enum(['APROBAR', 'APROBAR_CON_CORRECCIONES', 'RECHAZAR']),
  comments: z
    .string()
    .trim()
    .min(5, 'Debe justificar su dictamen con al menos 5 caracteres')
    .max(5000),
  observations: z
    .array(z.string().trim().min(1).max(1000))
    .max(30)
    .optional(),
});

const publishArticleSchema = z.object({
  publishedAt: z.coerce.date().optional(),
  editionNumber: z.string().trim().max(100).optional(),
  doi: z.string().trim().max(255).optional(),
  keywords: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
});

const withdrawArticleSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Debe indicar un motivo de retiro de al menos 5 caracteres')
    .max(5000),
  password: z.string().min(1, 'La contraseña actual es obligatoria'),
});

const getId = (value: string): number | undefined => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

const removeUploadedFile = async (
  file: Express.Multer.File | undefined,
): Promise<void> => {
  if (!file) return;
  try {
    await unlink(file.path);
  } catch (error: unknown) {
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      error.code !== 'ENOENT'
    ) {
      console.error('No se pudo eliminar el PDF temporal:', error);
    }
  }
};

const normalizeCreateBody = (body: unknown): unknown => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return body;
  }

  const requestBody = body as Record<string, unknown>;
  const coauthors = parseCoauthors(requestBody.coauthors);

  return {
    ...requestBody,
    specialtyId: Number(requestBody.specialtyId),
    convocatoriaId: Number(requestBody.convocatoriaId),
    abstract:
      typeof requestBody.abstract === 'string'
        ? requestBody.abstract
        : typeof requestBody.summary === 'string'
          ? requestBody.summary
          : undefined,
    ...(coauthors !== undefined ? { coauthors } : {}),
  };
};

const normalizeVersionBody = (body: unknown): unknown => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return {};
  }

  const requestBody = body as Record<string, unknown>;
  const coauthors =
    'coauthors' in requestBody ? parseCoauthors(requestBody.coauthors) : undefined;

  return {
    ...(typeof requestBody.title === 'string' && requestBody.title.trim()
      ? { title: requestBody.title }
      : {}),
    ...(typeof requestBody.abstract === 'string' && requestBody.abstract.trim()
      ? { abstract: requestBody.abstract }
      : typeof requestBody.summary === 'string' && requestBody.summary.trim()
        ? { abstract: requestBody.summary }
        : {}),
    ...(typeof requestBody.notes === 'string' && requestBody.notes.trim()
      ? { notes: requestBody.notes }
      : {}),
    ...(coauthors !== undefined ? { coauthors } : {}),
  };
};

const getAuthenticatedUser = (req: Request): AuthenticatedArticleUser | undefined => {
  if (!req.user) {
    return undefined;
  }
  return {
    id: req.user.id,
    role: req.user.role,
    is_author: req.user.is_author,
  };
};

export class ArticuloController {
  constructor(private readonly articuloService = new ArticuloService()) {}

  listarPublicados = async (
    req: Request,
    res: Response<ApiResponse<PublishedArticleDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const convocatoriaIdValue =
        typeof req.query.convocatoriaId === 'string'
          ? Number(req.query.convocatoriaId)
          : undefined;
      if (
        convocatoriaIdValue !== undefined &&
        (!Number.isSafeInteger(convocatoriaIdValue) || convocatoriaIdValue < 1)
      ) {
        res.status(400).json({
          success: false,
          error: 'convocatoriaId debe ser un entero positivo',
        });
        return;
      }
      const data = await this.articuloService.listarArticulosPublicados(convocatoriaIdValue);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  descargarPublicado = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    try {
      const { pdfPath, fileName } =
        await this.articuloService.obtenerPdfPublicado(id);
      const openInline =
        req.query.inline === '1' || req.query.inline === 'true';

      if (openInline) {
        const asciiFallback = fileName.replace(/[^\x20-\x7E]/g, '_');
        res.sendFile(
          pdfPath,
          {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            },
          },
          (error) => {
            if (error) {
              next(error);
            }
          },
        );
        return;
      }

      res.download(pdfPath, fileName, (error) => {
        if (error) {
          next(error);
        }
      });
    } catch (error: unknown) {
      next(error);
    }
  };

  descargarPdfPrivado = async (
    req: Request<{ id: string; versionId?: string }>,
    res: Response,
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

    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    let versionId: number | undefined;
    if (req.params.versionId !== undefined) {
      versionId = getId(req.params.versionId);
      if (!versionId) {
        res.status(400).json({
          success: false,
          error: 'El versionId debe ser un entero positivo',
        });
        return;
      }
    }

    try {
      const { pdfPath, fileName } =
        await this.articuloService.obtenerPdfAutenticado(id, user, versionId);
      const asciiFallback = fileName.replace(/[^\x20-\x7E]/g, '_');
      res.sendFile(
        pdfPath,
        {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
          },
        },
        (error) => {
          if (error) {
            next(error);
          }
        },
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  listarRevisores = async (
    _req: Request,
    res: Response<ApiResponse<ReviewerCandidateDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.articuloService.listarRevisores();
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  crear = async (
    req: Request,
    res: Response<ApiResponse<ArticleDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      await removeUploadedFile(req.file);
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
      await removeUploadedFile(req.file);
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

  subirVersion = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<ArticleDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      await removeUploadedFile(req.file);
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente',
      });
      return;
    }

    const id = getId(req.params.id);
    if (!id) {
      await removeUploadedFile(req.file);
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Debe adjuntar el archivo PDF corregido en el campo file',
      });
      return;
    }

    const parsedData = createVersionSchema.safeParse(normalizeVersionBody(req.body));
    if (!parsedData.success) {
      await removeUploadedFile(req.file);
      res.status(400).json({
        success: false,
        error: 'Los datos de la nueva versión son inválidos',
      });
      return;
    }

    try {
      const data = await this.articuloService.subirNuevaVersion(
        id,
        parsedData.data,
        req.file,
        user,
      );
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  rechazarDdi = async (
    req: Request<{ id: string }>,
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

    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    const parsed = deskRejectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Debe indicar el motivo del rechazo',
      });
      return;
    }

    try {
      const data = await this.articuloService.rechazarEnEscritorio(
        id,
        parsed.data.reason,
        user,
      );
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  asignarRevisores = async (
    req: Request<{ id: string }>,
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

    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    const parsed = assignReviewersSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          'Debe seleccionar 1 o 3 revisores del Comité',
      });
      return;
    }

    try {
      const data = await this.articuloService.asignarRevisores(
        id,
        parsed.data.reviewerIds,
        user,
      );
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  emitirDictamen = async (
    req: Request<{ id: string }>,
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

    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    const parsed = submitVerdictSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error:
          parsed.error.issues[0]?.message ?? 'Los datos del dictamen son inválidos',
      });
      return;
    }

    try {
      const data = await this.articuloService.emitirDictamen(id, parsed.data, user);
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  aprobarCorreccion = async (
    req: Request<{ id: string }>,
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

    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    try {
      const data = await this.articuloService.aprobarCorreccion(id, user);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  publicar = async (
    req: Request<{ id: string }>,
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

    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    const parsed = publishArticleSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          'Los metadatos de publicación son inválidos',
      });
      return;
    }

    try {
      const data = await this.articuloService.publicarArticulo(id, parsed.data, user);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  retirar = async (
    req: Request<{ id: string }>,
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

    const id = getId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, error: 'El id debe ser un entero positivo' });
      return;
    }

    const parsed = withdrawArticleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          'Debe indicar el motivo y su contraseña actual',
      });
      return;
    }

    try {
      const data = await this.articuloService.retirarArticulo(
        id,
        parsed.data.reason,
        parsed.data.password,
        user,
      );
      res.status(200).json({ success: true, data });
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
}
