// src/types/api.types.ts

/**
 * Estructura estándar de respuesta del backend.
 * Todas las rutas de la API devuelven este formato.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Estructura estándar para respuestas paginadas.
 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
