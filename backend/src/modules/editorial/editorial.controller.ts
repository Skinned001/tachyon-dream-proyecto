import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { ApiResponse } from "../auth/auth.dto.js";
import { registrarAuditoria } from "../../services/auditoria.service.js";
import { EditorialService, type ConvocatoriaDTO } from "./editorial.service.js";

const estadoSchema = z.enum(["BORRADOR", "PROGRAMADA", "ABIERTA", "CERRADA"]);

const createSchema = z
  .object({
    title: z.string().trim().min(1),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date(),
    visibleEnLanding: z.boolean().optional().default(false),
    estado: z.enum(["BORRADOR", "PROGRAMADA", "ABIERTA"]).optional(),
  })
  .strip();

const updateSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),
    visibleEnLanding: z.boolean().optional(),
    estado: estadoSchema.optional(),
    password: z.string().min(1),
  })
  .strip();

const finalizeSchema = z.object({ password: z.string().min(1) }).strict();

const getId = (value: string): number | undefined => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

export class EditorialController {
  constructor(private readonly service = new EditorialService()) {}

  listar = async (
    _req: Request,
    res: Response<ApiResponse<ConvocatoriaDTO[]>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      res
        .status(200)
        .json({
          success: true,
          data: await this.service.listarConvocatorias(),
        });
    } catch (error: unknown) {
      next(error);
    }
  };

  listarPublicas = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      res
        .status(200)
        .json({ success: true, data: await this.service.listarPublicas() });
    } catch (error: unknown) {
      next(error);
    }
  };

  crear = async (
    req: Request,
    res: Response<ApiResponse<ConvocatoriaDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          success: false,
          error: "Los datos de la convocatoria son inválidos",
        });
      return;
    }
    try {
      const data = await this.service.crearConvocatoria(parsed.data);
      await registrarAuditoria({
        userId: req.user?.id ?? null,
        actorRole: req.user?.role ?? null,
        action: "CONVOCATORIA_CREADA",
        entityType: "CONVOCATORIA",
        entityId: data.id,
        summary: `Creó la convocatoria "${data.title}" (${data.estado}).`,
        details: {
          estado: data.estado,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          visibleEnLanding: data.visibleEnLanding,
        },
      });
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  editar = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<ConvocatoriaDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = getId(req.params.id);
    if (!id) {
      res
        .status(400)
        .json({ success: false, error: "El id debe ser un entero positivo" });
      return;
    }
    if (!req.user) {
      res
        .status(401)
        .json({
          success: false,
          error: "Sesión expirada. Inicie sesión nuevamente",
        });
      return;
    }

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, error: "Los datos de edición son inválidos" });
      return;
    }
    try {
      const data = await this.service.editarConvocatoria(
        id,
        req.user.id,
        parsed.data,
      );
      await registrarAuditoria({
        userId: req.user.id,
        actorRole: req.user.role,
        action: "CONVOCATORIA_EDITADA",
        entityType: "CONVOCATORIA",
        entityId: data.id,
        summary: `Editó la convocatoria "${data.title}" (${data.estado}).`,
        details: {
          estado: data.estado,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          visibleEnLanding: data.visibleEnLanding,
        },
      });
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };

  finalizar = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<ConvocatoriaDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    const id = getId(req.params.id);
    if (!id) {
      res
        .status(400)
        .json({ success: false, error: "El id debe ser un entero positivo" });
      return;
    }
    if (!req.user) {
      res
        .status(401)
        .json({
          success: false,
          error: "Sesión expirada. Inicie sesión nuevamente",
        });
      return;
    }

    const parsed = finalizeSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, error: "La contraseña es obligatoria" });
      return;
    }
    try {
      const data = await this.service.finalizarConvocatoria(
        id,
        req.user.id,
        parsed.data.password,
      );
      await registrarAuditoria({
        userId: req.user.id,
        actorRole: req.user.role,
        action: "CONVOCATORIA_FINALIZADA",
        entityType: "CONVOCATORIA",
        entityId: data.id,
        summary: `Finalizó anticipadamente la convocatoria "${data.title}".`,
        details: { fechaFin: data.fechaFin },
      });
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };
}
