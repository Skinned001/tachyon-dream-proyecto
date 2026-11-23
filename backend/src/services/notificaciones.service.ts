import { Op, UniqueConstraintError } from 'sequelize';
import type { RoleName } from '../modules/auth/auth.dto.js';
import { Notificacion } from '../modules/notificaciones/Notificacion.model.js';
import { Rol } from '../modules/usuarios/Rol.model.js';
import { Usuario } from '../modules/usuarios/Usuario.model.js';

const TIPOS_SIN_DUPLICADOS = new Set(['CONVOCATORIA_ABIERTA', 'RECORDATORIO_CIERRE']);

export const crearNotificacion = async (
  usuarioId: number,
  tipo: string,
  titulo: string,
  mensaje: string,
  referenciaId?: number,
): Promise<Notificacion | null> => {
  const where =
    referenciaId !== undefined
      ? { userId: usuarioId, tipo, referenciaId }
      : undefined;
  const deduplicar = where !== undefined && TIPOS_SIN_DUPLICADOS.has(tipo);

  if (deduplicar && where) {
    const existente = await Notificacion.findOne({ where });
    if (existente) {
      return null;
    }
  }

  try {
    return await Notificacion.create({
      userId: usuarioId,
      tipo,
      title: titulo,
      message: mensaje,
      read: false,
      ...(referenciaId !== undefined ? { referenciaId } : {}),
    });
  } catch (error: unknown) {
    if (deduplicar && where && error instanceof UniqueConstraintError) {
      const existente = await Notificacion.findOne({ where });
      if (existente) {
        return null;
      }
    }
    throw error;
  }
};

export const notificarAutoresActivos = async (
  tipo: string,
  titulo: string,
  mensaje: string,
  referenciaId?: number,
): Promise<number> => {
  const autores = await Usuario.findAll({
    attributes: ['id'],
    where: {
      active: true,
      is_author: true,
      recibirNotificaciones: true,
    },
    include: [
      {
        model: Rol,
        as: 'role',
        attributes: [],
        where: { name: { [Op.in]: ['AUTOR', 'STAFF'] } },
      },
    ],
  });

  let creadas = 0;
  for (const autor of autores) {
    const notificacion = await crearNotificacion(
      autor.id,
      tipo,
      titulo,
      mensaje,
      referenciaId,
    );
    if (notificacion) {
      creadas += 1;
    }
  }
  return creadas;
};

export const notificarUsuariosPorIds = async (
  userIds: number[],
  tipo: string,
  titulo: string,
  mensaje: string,
  referenciaId?: number,
): Promise<number> => {
  const uniqueIds = Array.from(new Set(userIds));
  let creadas = 0;
  for (const userId of uniqueIds) {
    const notificacion = await crearNotificacion(
      userId,
      tipo,
      titulo,
      mensaje,
      referenciaId,
    );
    if (notificacion) {
      creadas += 1;
    }
  }
  return creadas;
};

export const notificarUsuariosPorRol = async (
  roles: RoleName[],
  tipo: string,
  titulo: string,
  mensaje: string,
  referenciaId?: number,
): Promise<number> => {
  const usuarios = await Usuario.findAll({
    attributes: ['id'],
    where: { active: true },
    include: [
      {
        model: Rol,
        as: 'role',
        attributes: [],
        where: { name: { [Op.in]: roles } },
      },
    ],
  });

  return notificarUsuariosPorIds(
    usuarios.map((usuario) => usuario.id),
    tipo,
    titulo,
    mensaje,
    referenciaId,
  );
};
