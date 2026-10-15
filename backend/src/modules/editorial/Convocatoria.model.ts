import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export class Convocatoria extends Model<
  InferAttributes<Convocatoria>,
  InferCreationAttributes<Convocatoria>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare start_date: Date;
  declare end_date: Date;
  declare active: boolean;
}

export const initializeConvocatoriaModel = (sequelize: Sequelize): void => {
  Convocatoria.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: false },
      active: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    { sequelize, tableName: 'convocations', timestamps: false },
  );
};

export { Convocatoria as ConvocatoriaModel };
