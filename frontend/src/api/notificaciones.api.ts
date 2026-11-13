import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export interface Notificacion {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string | null;
}

export const getNotificaciones = async (): Promise<Notificacion[]> => {
  const { data } = await axiosClient.get<ApiResponse<Notificacion[]>>(
    '/notificaciones',
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al cargar las notificaciones');
  }
  return data.data;
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
