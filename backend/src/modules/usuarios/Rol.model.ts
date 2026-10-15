import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export class Rol extends Model<InferAttributes<Rol>, InferCreationAttributes<Rol>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string;
}

export const initializeRolModel = (sequelize: Sequelize): void => {
  Rol.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
    },
    { sequelize, tableName: 'roles', timestamps: false },
  );
};

export { Rol as RolModel };
