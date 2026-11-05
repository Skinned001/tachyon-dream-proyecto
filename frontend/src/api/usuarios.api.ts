// src/api/usuarios.api.ts
import { axiosClient } from './axiosClient';
import type { ApiResponse, Paginated } from '../types/api.types';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types/user.types';

// ==========================================
// MOCK DE DATOS (Temporal hasta que el backend esté listo)
// ==========================================
const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin_hief',
    email: 'admin@hief.gob.ar',
    first_name: 'Admin',
    last_name: 'Sistema',
    role: 'ADMIN',
    specialtyId: null,
    must_change_password: false,
    active: true,
  },
  {
    id: 2,
    username: 'dr_laprida',
    email: 'fernando@hief.gob.ar',
    first_name: 'Fernando',
    last_name: 'Laprida',
    role: 'AUTOR',
    specialtyId: 1,
    must_change_password: false,
    active: true,
  },
  {
    id: 3,
    username: 'dra_gonzalez',
    email: 'maria@hief.gob.ar',
    first_name: 'María',
    last_name: 'Gonzalez',
    role: 'COMITE',
    specialtyId: 2,
    must_change_password: false,
    active: true,
  },
  {
    id: 4,
    username: 'dr_short',
    email: 'lautaro@hief.gob.ar',
    first_name: 'Lautaro',
    last_name: 'Short',
    role: 'AUTOR',
    specialtyId: 1,
    must_change_password: false,
    active: false,
  },
];

// Listar usuarios (MOCK)
export const getUsuarios = async (): Promise<User[]> => {
  // Simulamos un retraso de 800ms para ver el spinner
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USERS);
    }, 800);
  });

  /*
  // CÓDIGO REAL (Descomentar cuando el backend esté listo)
  const { data } = await axiosClient.get<ApiResponse<Paginated<User>>>('/usuarios');
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al obtener usuarios');
  }
  return data.data.items;
  */
};

// Crear usuario (MOCK temporal)
export const createUsuario = async (payload: CreateUserRequest): Promise<User> => {
  console.log('Mock: Creando usuario', payload);
  const newUser: User = {
    id: Math.random(),
    username: payload.username,
    email: payload.email,
    first_name: payload.first_name,
    last_name: payload.last_name,
    role: payload.role,
    specialtyId: payload.specialtyId || null,
    must_change_password: true,
    active: true,
  };
  MOCK_USERS.push(newUser);
  return newUser;
};

// Actualizar usuario (Se deja preparado para el backend real)
export const updateUsuario = async (id: number, payload: UpdateUserRequest): Promise<User> => {
  const { data } = await axiosClient.put<ApiResponse<User>>(`/usuarios/${id}`, payload);
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al actualizar usuario');
  }
  return data.data;
};

// Dar de baja (MOCK temporal)
export const deleteUsuario = async (id: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 500);
  });

  const usuario = MOCK_USERS.find((user) => user.id === id);
  if (!usuario) {
    throw new Error('No se encontró el usuario para suspender');
  }

  usuario.active = false;
};

// Reiniciar contraseña (MOCK)
export const resetPassword = async (id: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Mock: Contraseña reiniciada para el usuario ${id}`);
      resolve();
    }, 500);
  });
};
