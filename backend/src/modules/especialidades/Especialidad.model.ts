import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export class Especialidad extends Model<
  InferAttributes<Especialidad>,
  InferCreationAttributes<Especialidad>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string;
  declare active: boolean;
}

export const initializeEspecialidadModel = (sequelize: Sequelize): void => {
  Especialidad.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      active: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    { sequelize, tableName: 'specialties', timestamps: false },
  );
};

export { Especialidad as EspecialidadModel };
