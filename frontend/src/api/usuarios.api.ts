// src/api/usuarios.api.ts
import { axiosClient } from './axiosClient';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user.types';

export type CreateUsuarioResponse = User & { temporaryPassword: string };

// Listar usuarios (Admin)
export const getUsuarios = async (): Promise<User[]> => {
  const { data } = await axiosClient.get<ApiResponse<Paginated<User>>>('/usuarios');
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al obtener usuarios');
  }
  return data.data.items;
};

// Crear usuario (Admin)
export const createUsuario = async (
  payload: CreateUserRequest,
): Promise<CreateUsuarioResponse> => {
  const { data } = await axiosClient.post<ApiResponse<CreateUsuarioResponse>>(
    '/usuarios',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al crear usuario');
  }
  return data.data;
};

// Actualizar usuario (Admin)
export const updateUsuario = async (id: number, payload: UpdateUserRequest): Promise<User> => {
  const { data } = await axiosClient.put<ApiResponse<User>>(`/usuarios/${id}`, payload);
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al actualizar usuario');
  }
  return data.data;
};

// Dar de baja (Lógica) (Admin)
export const deleteUsuario = async (id: number): Promise<void> => {
  const { data } = await axiosClient.delete<ApiResponse<void>>(`/usuarios/${id}`);
  if (!data.success) {
    throw new Error(data.error || 'Error al suspender usuario');
  }
};

// Reiniciar contraseña (Admin)
export const resetPassword = async (id: number): Promise<void> => {
  const { data } = await axiosClient.post<ApiResponse<void>>(`/usuarios/${id}/reset-password`);
  if (!data.success) {
    throw new Error(data.error || 'Error al reiniciar contraseña');
  }
};
