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
