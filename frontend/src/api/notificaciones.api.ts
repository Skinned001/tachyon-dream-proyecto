import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export interface Notificacion {
  id: number;
  title: string;
  message: string;
  read: boolean;
  tipo: string;
  referenciaId: number | null;
  createdAt: string | null;
}

export interface NotificacionesList {
  notificaciones: Notificacion[];
  noLeidasCount: number;
}

export const getNotificaciones = async (): Promise<NotificacionesList> => {
  const { data } = await axiosClient.get<ApiResponse<NotificacionesList>>(
    '/notificaciones',
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al cargar las notificaciones');
  }
  return data.data;
};

export const markAsRead = async (id: number): Promise<void> => {
  const { data } = await axiosClient.patch<ApiResponse<Notificacion>>(
    `/notificaciones/${id}/leer`,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al marcar la notificación como leída');
  }
};

export const markAllAsRead = async (): Promise<void> => {
  const { data } = await axiosClient.patch<ApiResponse<{ updated: number }>>(
    '/notificaciones/leer-todas',
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al marcar todas las notificaciones como leídas');
  }
};

export const updateNotificationPreference = async (
  recibirNotificaciones: boolean,
): Promise<boolean> => {
  const { data } = await axiosClient.patch<
    ApiResponse<{ recibirNotificaciones: boolean }>
  >('/notificaciones/preferencias', { recibirNotificaciones });
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al actualizar las preferencias');
  }
  return data.data.recibirNotificaciones;
};
