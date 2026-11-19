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
  declare fechaInicio: Date;
  declare fechaFin: Date;
  declare estado: CreationOptional<
    'BORRADOR' | 'PROGRAMADA' | 'ABIERTA' | 'CERRADA'
  >;
  declare visibleEnLanding: CreationOptional<boolean>;
}

export const initializeConvocatoriaModel = (sequelize: Sequelize): void => {
  Convocatoria.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      fechaInicio: { type: DataTypes.DATE, allowNull: false },
      fechaFin: { type: DataTypes.DATE, allowNull: false },
      estado: {
        type: DataTypes.ENUM('BORRADOR', 'PROGRAMADA', 'ABIERTA', 'CERRADA'),
        allowNull: false,
        defaultValue: 'BORRADOR',
      },
      visibleEnLanding: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    { sequelize, tableName: 'convocations', timestamps: false },
  );
};

export { Convocatoria as ConvocatoriaModel };
