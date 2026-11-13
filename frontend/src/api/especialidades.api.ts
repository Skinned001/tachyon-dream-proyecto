import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export interface Especialidad {
  id: number;
  name: string;
}

export const getEspecialidades = async (): Promise<Especialidad[]> => {
  const { data } = await axiosClient.get<ApiResponse<Especialidad[]>>(
    '/especialidades',
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al obtener especialidades');
  }
  return data.data;
};
