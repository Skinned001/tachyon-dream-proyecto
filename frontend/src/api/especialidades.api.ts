import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export interface Especialidad {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export const getEspecialidades = async (): Promise<Especialidad[]> => {
  const { data } = await axiosClient.get<ApiResponse<Especialidad[]>>(
    '/especialidades',
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error ?? 'No se pudieron cargar las especialidades.');
  }
  return data.data;
};
