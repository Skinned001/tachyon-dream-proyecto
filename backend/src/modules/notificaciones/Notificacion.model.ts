import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export class Notificacion extends Model<
  InferAttributes<Notificacion>,
  InferCreationAttributes<Notificacion>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare message: string;
}

export const initializeNotificacionModel = (sequelize: Sequelize): void => {
  Notificacion.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
    },
    { sequelize, tableName: 'notificaciones', timestamps: false },
  );
};

export { Notificacion as NotificacionModel };
