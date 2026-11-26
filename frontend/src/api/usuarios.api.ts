// src/api/usuarios.api.ts
import { axiosClient } from './axiosClient';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user.types';

export interface UsuarioPendiente {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  comentarios?: string;
  credencialUrl?: string;
  createdAt: string;
}

interface ApprovalResponse {
  message: string;
  emailSent: boolean;
  warning?: string;
}

interface RejectionResponse {
  message: string;
  warning?: string;
}

export interface CreateUsuarioResponse {
  usuario: User;
  tempPassword: string;
}

interface CreateUsuarioApiResponse extends User {
  temporaryPassword: string;
}

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
  const { data } = await axiosClient.post<ApiResponse<CreateUsuarioApiResponse>>(
    '/usuarios',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al crear usuario');
  }
  const { temporaryPassword, ...usuario } = data.data;
  return { usuario, tempPassword: temporaryPassword };
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
export const resetPassword = async (id: number): Promise<string> => {
  const { data } = await axiosClient.post<ApiResponse<{ temporaryPassword: string }>>(
    `/usuarios/${id}/reset-password`,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al reiniciar contraseña');
  }
  return data.data.temporaryPassword;
};

export const getUsuariosPendientes = async (): Promise<UsuarioPendiente[]> => {
  const { data } = await axiosClient.get<
    ApiResponse<Paginated<UsuarioPendiente>>
  >('/usuarios?estado=PENDIENTE');
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al obtener solicitudes pendientes');
  }
  return data.data.items;
};

export const aprobarUsuario = async (
  id: number,
): Promise<ApprovalResponse> => {
  const { data } = await axiosClient.patch<ApiResponse<ApprovalResponse>>(
    `/usuarios/${id}/aprobar`,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al aprobar usuario');
  }
  return data.data;
};

export const rechazarUsuario = async (
  id: number,
): Promise<RejectionResponse> => {
  const { data } = await axiosClient.patch<ApiResponse<RejectionResponse>>(
    `/usuarios/${id}/rechazar`,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al rechazar solicitud');
  }
  return data.data;
};

export const getCredencialUrl = (id: number): string =>
  axiosClient.getUri({ url: `/usuarios/${id}/credencial` });
