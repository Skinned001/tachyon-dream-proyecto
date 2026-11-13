import { Notificacion } from './Notificacion.model.js';

export interface NotificacionDTO {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string | null;
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
  async findAll(userId: number): Promise<NotificacionDTO[]> {
    const notifications = await Notificacion.findAll({
      where: { userId },
      order: [['id', 'DESC']],
    });
    return notifications.map(({ id, title, message, read, createdAt }) => ({
      id,
      title,
      message,
      read,
      createdAt: serializeCreatedAt(createdAt),
    }));
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
}
