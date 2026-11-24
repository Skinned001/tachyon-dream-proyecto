import axiosClient from './axiosClient';
import type { ApiResponse, Paginated } from '../types/api.types';

export type AuditEntityType =
  | 'ARTICULO'
  | 'CONVOCATORIA'
  | 'USUARIO'
  | 'RECURSO_BIBLIOTECA'
  | 'ESPECIALIDAD';

export interface AuditLogItem {
  id: number;
  userId: number | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  entityType: AuditEntityType;
  entityId: number | null;
  summary: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogFilters {
  entityType?: AuditEntityType | '';
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const getAuditLogs = async (
  filters: AuditLogFilters = {},
): Promise<Paginated<AuditLogItem>> => {
  const params: Record<string, string | number> = {};
  if (filters.entityType) params.entityType = filters.entityType;
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const { data } = await axiosClient.get<ApiResponse<Paginated<AuditLogItem>>>(
    '/auditoria',
    { params },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudieron cargar los registros de auditoría.');
  }
  return data.data;
};
