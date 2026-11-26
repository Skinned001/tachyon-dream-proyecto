import {
  AuditLog,
  type AuditEntityType,
} from '../modules/auditoria/AuditLog.model.js';
import { Rol } from '../modules/usuarios/Rol.model.js';
import { Usuario } from '../modules/usuarios/Usuario.model.js';

export interface RegistrarAuditoriaInput {
  userId?: number | null;
  actorName?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: AuditEntityType;
  entityId?: number | null;
  summary: string;
  details?: Record<string, unknown> | null;
}

export const registrarAuditoria = async (
  input: RegistrarAuditoriaInput,
): Promise<void> => {
  try {
    let actorName = input.actorName ?? null;
    let actorRole = input.actorRole ?? null;

    if (input.userId && (!actorName || !actorRole)) {
      const user = await Usuario.findByPk(input.userId, {
        attributes: ['id', 'first_name', 'last_name', 'email', 'roleId'],
        include: [{ model: Rol, as: 'role', attributes: ['name'] }],
      });
      if (user) {
        if (!actorName) {
          const fullName = `${user.first_name} ${user.last_name}`.trim();
          actorName = fullName ? `${fullName} (${user.email})` : user.email;
        }
        if (!actorRole && user.role?.name) {
          actorRole = user.role.name;
        }
      }
    }

    await AuditLog.create({
      userId: input.userId ?? null,
      actorName,
      actorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary.slice(0, 500),
      details: input.details ?? null,
    });
  } catch (error: unknown) {
    console.error('Error al registrar evento de auditoría:', error);
  }
};
