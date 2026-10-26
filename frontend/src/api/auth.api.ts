import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/user.types';

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await axiosClient.post<
    ApiResponse<{ token: string; user: User }>
  >('/auth/login', { email, password });

  if (!data.success || !data.data?.user) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  return data.data.user;
};
