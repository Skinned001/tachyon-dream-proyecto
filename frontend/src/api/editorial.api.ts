import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/user.types';

export interface ArticuloPendiente {
  id: number;
  title: string;
  summary?: string;
  state: string;
  specialtyId: number;
  specialty?: { id: number; name: string };
  createdAt: string;
}

export const editorialApi = {
  list: () => axiosClient.get('/editorial/convocatorias'),
};

export const getArticulosPendientes = async (): Promise<ArticuloPendiente[]> => {
  const { data } = await axiosClient.get<ApiResponse<ArticuloPendiente[]>>(
    '/editorial/articulos-pendientes',
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error || 'Error al cargar artículos pendientes');
  }
  return data.data;
};

export const getEspecialistas = async (): Promise<User[]> => {
  const { data } = await axiosClient.get<ApiResponse<User[]>>(
    '/usuarios/especialistas',
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error || 'Error al cargar especialistas');
  }
  return data.data;
};

export const asignarRevisor = async (
  articleId: number,
  reviewerId: number,
): Promise<void> => {
  const { data } = await axiosClient.post<
    ApiResponse<{ articleId: number; reviewerId: number }>
  >(`/editorial/${articleId}/asignar`, { reviewerId });
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al asignar revisor');
  }
};
