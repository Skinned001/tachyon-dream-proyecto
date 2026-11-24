import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export interface Especialidad {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export const getEspecialidades = async (
  soloActivas = true,
): Promise<Especialidad[]> => {
  const { data } = await axiosClient.get<ApiResponse<Especialidad[]>>(
    soloActivas ? '/especialidades' : '/especialidades/admin',
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error || 'Error al obtener especialidades');
  }
  return soloActivas
    ? data.data.filter((especialidad) => especialidad.active)
    : data.data;
};

export const createEspecialidad = async (payload: {
  name: string;
  description?: string;
}): Promise<Especialidad> => {
  const { data } = await axiosClient.post<ApiResponse<Especialidad>>(
    '/especialidades',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al crear especialidad');
  }
  return data.data;
};

export const updateEspecialidad = async (
  id: number,
  payload: { name?: string; description?: string; active?: boolean },
): Promise<Especialidad> => {
  const { data } = await axiosClient.put<ApiResponse<Especialidad>>(
    `/especialidades/${id}`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al actualizar especialidad');
  }
  return data.data;
};
