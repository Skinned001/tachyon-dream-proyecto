import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import type { Especialidad } from '../especialidades/Especialidad.model.js';

export type MetricEventType = 'VISIT' | 'DOWNLOAD';
export type MetricEntityType = 'PORTAL' | 'ARTICULO' | 'RECURSO_BIBLIOTECA';

export class MetricEvent extends Model<
  InferAttributes<MetricEvent>,
  InferCreationAttributes<MetricEvent>
> {
  declare id: CreationOptional<number>;
  declare eventType: MetricEventType;
  declare entityType: MetricEntityType;
  declare entityId: CreationOptional<number | null>;
  declare specialtyId: CreationOptional<number | null>;
  declare visitorHash: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare specialty?: NonAttribute<Especialidad>;
}

export const initializeMetricEventModel = (sequelize: Sequelize): void => {
  MetricEvent.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      eventType: {
        type: DataTypes.ENUM('VISIT', 'DOWNLOAD'),
        allowNull: false,
      },
      entityType: {
        type: DataTypes.ENUM('PORTAL', 'ARTICULO', 'RECURSO_BIBLIOTECA'),
        allowNull: false,
      },
      entityId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      specialtyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: { model: 'specialties', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      visitorHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'metric_events',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
      indexes: [
        { fields: ['createdAt'] },
        { fields: ['eventType', 'createdAt'] },
        { fields: ['specialtyId'] },
        { fields: ['entityType', 'entityId'] },
        { fields: ['visitorHash'] },
      ],
    },
  );
};
