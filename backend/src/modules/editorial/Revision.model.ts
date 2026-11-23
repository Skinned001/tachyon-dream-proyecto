import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import type { AsignacionComite } from './AsignacionComite.model.js';

export type ReviewVerdict = 'APROBAR' | 'APROBAR_CON_CORRECCIONES' | 'RECHAZAR';

export class Revision extends Model<InferAttributes<Revision>, InferCreationAttributes<Revision>> {
  declare id: CreationOptional<number>;
  declare verdict: ReviewVerdict;
  declare comments: string;
  declare observations: CreationOptional<string[] | null>;
  declare assignmentId: number;
  declare versionId: number;
  declare createdAt: CreationOptional<Date>;
  declare assignment?: NonAttribute<AsignacionComite>;
}

export const initializeRevisionModel = (sequelize: Sequelize): void => {
  Revision.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      verdict: {
        type: DataTypes.ENUM('APROBAR', 'APROBAR_CON_CORRECCIONES', 'RECHAZAR'),
        allowNull: false,
      },
      comments: { type: DataTypes.TEXT, allowNull: false },
      observations: { type: DataTypes.JSON, allowNull: true, defaultValue: null },
      assignmentId: { type: DataTypes.INTEGER, allowNull: false },
      versionId: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'reviews',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
    },
  );
};

export { Revision as RevisionModel };
