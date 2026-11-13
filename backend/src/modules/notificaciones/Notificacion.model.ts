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
  declare title: CreationOptional<string>;
  declare message: string;
  declare read: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const initializeNotificacionModel = (sequelize: Sequelize): void => {
  Notificacion.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Notificación' },
      message: { type: DataTypes.TEXT, allowNull: false },
      read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'notificaciones', timestamps: true },
  );
};

export { Notificacion as NotificacionModel };
