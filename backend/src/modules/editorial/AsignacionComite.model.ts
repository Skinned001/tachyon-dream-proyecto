import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export class AsignacionComite extends Model<
  InferAttributes<AsignacionComite>,
  InferCreationAttributes<AsignacionComite>
> {
  declare id: CreationOptional<number>;
  declare read_status: boolean;
  declare reviewerId: number;
  declare articleId: number;
}

export const initializeAsignacionComiteModel = (sequelize: Sequelize): void => {
  AsignacionComite.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      read_status: { type: DataTypes.BOOLEAN, allowNull: false },
      reviewerId: { type: DataTypes.INTEGER, allowNull: false },
      articleId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, tableName: 'committee_assignments', timestamps: false },
  );
};

export { AsignacionComite as AsignacionComiteModel };
