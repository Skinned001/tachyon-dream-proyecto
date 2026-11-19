import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export interface Notificacion {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNotificacion = (value: unknown): value is Notificacion =>
  isRecord(value) &&
  typeof value.id === 'number' &&
  typeof value.title === 'string' &&
  typeof value.message === 'string' &&
  typeof value.read === 'boolean' &&
  (value.createdAt === undefined ||
    value.createdAt === null ||
    typeof value.createdAt === 'string');

export const getNotificaciones = async (): Promise<Notificacion[]> => {
  const { data } = await axiosClient.get<ApiResponse<unknown>>(
    '/notificaciones',
  );
  if (!data.success) {
    throw new Error(data.error || 'Error al cargar las notificaciones');
  }

  const payload = data.data;
  let notifications: unknown;
  if (Array.isArray(payload)) {
    notifications = payload;
  } else if (isRecord(payload)) {
    if (Array.isArray(payload.notificaciones)) {
      notifications = payload.notificaciones;
    } else if (Array.isArray(payload.items)) {
      notifications = payload.items;
    } else if (Array.isArray(payload.data)) {
      notifications = payload.data;
    }
  }

  if (!Array.isArray(notifications) || !notifications.every(isNotificacion)) {
    throw new Error('El servidor devolvió un formato de notificaciones inválido');
  }
  return notifications;
};

export const markAsRead = async (id: number): Promise<void> => {
  const { data } = await axiosClient.patch<ApiResponse<Notificacion>>(
    `/notificaciones/${id}/read`,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al marcar la notificación como leída');
  }
};

export const markAllAsRead = async (): Promise<void> => {
  const { data } = await axiosClient.put<ApiResponse<{ updated: number }>>(
    '/notificaciones/read-all',
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al marcar todas las notificaciones como leídas');
  }
};
