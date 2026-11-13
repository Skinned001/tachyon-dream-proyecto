import { z } from 'zod';

export type RoleName = 'STAFF' | 'DDI' | 'COMITE' | 'EDITOR' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  dni: string;
  specialtyId?: number | null;
  comentarios?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  role: RoleName;
  is_author: boolean;
  specialtyId: number | null;
  must_change_password: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const registerRequestSchema = z.object({
  username: z.string().trim().min(1).max(255),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(72),
  first_name: z.string().trim().min(1).max(255),
  last_name: z.string().trim().min(1).max(255),
  dni: z.string().trim().min(1).max(255),
  specialtyId: z.preprocess(
    (value) => {
      if (value === '' || value === undefined) return undefined;
      if (typeof value === 'string') return Number(value);
      return value;
    },
    z.number().int().positive().nullable().optional(),
  ),
  comentarios: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(2000).optional(),
  ),
});

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

export const roleNames: readonly RoleName[] = [
  'STAFF',
  'DDI',
  'COMITE',
  'EDITOR',
  'ADMIN',
];

export const isRoleName = (value: string): value is RoleName =>
  roleNames.some((roleName) => roleName === value);
