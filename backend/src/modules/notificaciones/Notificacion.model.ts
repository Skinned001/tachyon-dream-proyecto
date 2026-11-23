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
  declare tipo: CreationOptional<string>;
  declare title: CreationOptional<string>;
  declare message: string;
  declare read: CreationOptional<boolean>;
  declare referenciaId: CreationOptional<number | null>;
  declare createdAt: CreationOptional<Date | null>;
  declare updatedAt: CreationOptional<Date | null>;
}

export const initializeNotificacionModel = (sequelize: Sequelize): void => {
  Notificacion.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      tipo: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'GENERAL' },
      title: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Notificación' },
      message: { type: DataTypes.TEXT, allowNull: false },
      read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      referenciaId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      createdAt: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'notificaciones',
      timestamps: true,
      indexes: [
        {
          fields: ['userId', 'tipo', 'referenciaId'],
        },
      ],
    },
  );
};

export { Notificacion as NotificacionModel };
