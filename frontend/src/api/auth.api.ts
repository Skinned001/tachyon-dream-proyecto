import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/api.types";
import type { User } from "../types/user.types";

export const login = async (email: string, password: string): Promise<User> => {
  const { data } = await axiosClient.post<
    ApiResponse<{ token: string; user: User }>
  >("/auth/login", { email, password });

  if (!data.success || !data.data) {
    throw new Error(data.error || "Error al iniciar sesión");
  }

  return data.data.user;
};

export const logout = async (): Promise<void> => {
  await axiosClient.post("/auth/logout");
};

export const verify = async (): Promise<User | null> => {
  try {
    const verifyRes =
      await axiosClient.get<ApiResponse<{ valid: boolean }>>("/auth/verify");

    if (!verifyRes.data.success || !verifyRes.data.data?.valid) {
      return null;
    }

    const meRes = await axiosClient.get<ApiResponse<User>>("/auth/me");

    if (meRes.data.success && meRes.data.data) {
      return meRes.data.data;
    }

    return null;
  } catch {
    return null;
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const { data } = await axiosClient.post<ApiResponse<void>>(
    '/auth/change-password',
    { currentPassword, newPassword },
  );
  if (!data.success) {
    throw new Error(data.error || 'Error al cambiar la contraseña');
  }
};

export const updateProfile = async (profile: {
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_image?: string | null;
}): Promise<User> => {
  const { data } = await axiosClient.put<ApiResponse<User>>(
    '/auth/profile',
    profile,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Error al actualizar perfil');
  }
  return data.data;
};
