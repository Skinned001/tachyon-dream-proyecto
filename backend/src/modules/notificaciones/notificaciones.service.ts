import { Notificacion } from './Notificacion.model.js';
import { Usuario } from '../usuarios/Usuario.model.js';

export interface NotificacionDTO {
  id: number;
  title: string;
  message: string;
  read: boolean;
  tipo: string;
  referenciaId: number | null;
  createdAt: string | null;
}

export interface NotificacionesListDTO {
  notificaciones: NotificacionDTO[];
  noLeidasCount: number;
}

const serializeCreatedAt = (value: Date | string | null | undefined): string | null => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export class NotificacionesError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'NotificacionesError';
  }
}

export class NotificacionesService {
  async findAll(userId: number): Promise<NotificacionesListDTO> {
    const [notifications, noLeidasCount] = await Promise.all([
      Notificacion.findAll({
        where: { userId },
        order: [
          ['createdAt', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: 30,
      }),
      Notificacion.count({ where: { userId, read: false } }),
    ]);
    return {
      notificaciones: notifications.map(
        ({ id, title, message, read, tipo, referenciaId, createdAt }) => ({
          id,
          title,
          message,
          read,
          tipo,
          referenciaId,
          createdAt: serializeCreatedAt(createdAt),
        }),
      ),
      noLeidasCount,
    };
  }

  async markAsRead(userId: number, id: number): Promise<NotificacionDTO> {
    const notification = await Notificacion.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotificacionesError(404, 'Notificación no encontrada');
    }

    if (!notification.read) {
      notification.read = true;
      await notification.save();
    }

    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      tipo: notification.tipo,
      referenciaId: notification.referenciaId,
      createdAt: serializeCreatedAt(notification.createdAt),
    };
  }

  async markAllAsRead(userId: number): Promise<number> {
    const [updatedCount] = await Notificacion.update(
      { read: true },
      { where: { userId, read: false } },
    );
    return updatedCount;
  }

  async updatePreferences(
    userId: number,
    recibirNotificaciones: boolean,
  ): Promise<{ recibirNotificaciones: boolean }> {
    const user = await Usuario.findByPk(userId);
    if (!user) {
      throw new NotificacionesError(404, 'Usuario no encontrado');
    }

    user.recibirNotificaciones = recibirNotificaciones;
    await user.save();
    return { recibirNotificaciones: user.recibirNotificaciones };
  }
}
