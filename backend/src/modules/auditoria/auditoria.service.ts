import { Op, type WhereOptions } from 'sequelize';
import { AuditLog, type AuditEntityType } from './AuditLog.model.js';

export interface AuditLogDTO {
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
  entityType?: AuditEntityType;
  action?: string;
  search?: string;
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
}

export interface PaginatedAuditLogsDTO {
  items: AuditLogDTO[];
  total: number;
  page: number;
  limit: number;
}

const parseDetails = (value: unknown): Record<string, unknown> | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
};

export class AuditoriaService {
  async listar(filters: AuditLogFilters): Promise<PaginatedAuditLogsDTO> {
    const where: WhereOptions = {};

    if (filters.entityType) {
      Object.assign(where, { entityType: filters.entityType });
    }
    if (filters.action) {
      Object.assign(where, { action: filters.action });
    }
    if (filters.search) {
      const pattern = `%${filters.search.trim()}%`;
      Object.assign(where, {
        [Op.or]: [
          { summary: { [Op.like]: pattern } },
          { actorName: { [Op.like]: pattern } },
          { action: { [Op.like]: pattern } },
        ],
      });
    }
    if (filters.from || filters.to) {
      const createdAtCondition: Record<symbol, Date> = {};
      if (filters.from) {
        createdAtCondition[Op.gte] = filters.from;
      }
      if (filters.to) {
        const endOfDay = new Date(filters.to);
        endOfDay.setHours(23, 59, 59, 999);
        createdAtCondition[Op.lte] = endOfDay;
      }
      Object.assign(where, { createdAt: createdAtCondition });
    }

    const offset = (filters.page - 1) * filters.limit;
    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: filters.limit,
      offset,
    });

    return {
      items: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        actorName: row.actorName,
        actorRole: row.actorRole,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        summary: row.summary,
        details: parseDetails(row.details),
        createdAt: row.createdAt.toISOString(),
      })),
      total: count,
      page: filters.page,
      limit: filters.limit,
    };
  }
}
