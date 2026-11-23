import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import type { Usuario } from '../usuarios/Usuario.model.js';

export type AuditEntityType =
  | 'ARTICULO'
  | 'CONVOCATORIA'
  | 'USUARIO'
  | 'RECURSO_BIBLIOTECA';

export class AuditLog extends Model<
  InferAttributes<AuditLog>,
  InferCreationAttributes<AuditLog>
> {
  declare id: CreationOptional<number>;
  declare userId: CreationOptional<number | null>;
  declare actorName: CreationOptional<string | null>;
  declare actorRole: CreationOptional<string | null>;
  declare action: string;
  declare entityType: AuditEntityType;
  declare entityId: CreationOptional<number | null>;
  declare summary: string;
  declare details: CreationOptional<Record<string, unknown> | null>;
  declare createdAt: CreationOptional<Date>;
  declare actor?: NonAttribute<Usuario>;
}

export const initializeAuditLogModel = (sequelize: Sequelize): void => {
  AuditLog.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      actorName: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
      actorRole: { type: DataTypes.STRING(32), allowNull: true, defaultValue: null },
      action: { type: DataTypes.STRING(80), allowNull: false },
      entityType: { type: DataTypes.STRING(50), allowNull: false },
      entityId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      summary: { type: DataTypes.STRING(500), allowNull: false },
      details: { type: DataTypes.JSON, allowNull: true, defaultValue: null },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'audit_logs',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
      indexes: [
        { fields: ['createdAt'] },
        { fields: ['action'] },
        { fields: ['entityType', 'entityId'] },
        { fields: ['userId'] },
      ],
    },
  );
};

export { AuditLog as AuditLogModel };
