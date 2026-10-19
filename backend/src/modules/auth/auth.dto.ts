import { z } from 'zod';

export type RoleName = 'AUTOR' | 'DDI' | 'COMITE' | 'PUBLISHER' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: RoleName;
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

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

export const roleNames: readonly RoleName[] = [
  'AUTOR',
  'DDI',
  'COMITE',
  'PUBLISHER',
  'ADMIN',
];

export const isRoleName = (value: string): value is RoleName =>
  roleNames.some((roleName) => roleName === value);
