import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export type ReviewVerdict = 'APROBAR' | 'APROBAR_CON_CORRECCIONES' | 'RECHAZAR';

export class Revision extends Model<InferAttributes<Revision>, InferCreationAttributes<Revision>> {
  declare id: CreationOptional<number>;
  declare verdict: ReviewVerdict;
  declare comments: string;
  declare assignmentId: number;
  declare versionId: number;
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
      assignmentId: { type: DataTypes.INTEGER, allowNull: false },
      versionId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, tableName: 'reviews', timestamps: false },
  );
};

export { Revision as RevisionModel };
