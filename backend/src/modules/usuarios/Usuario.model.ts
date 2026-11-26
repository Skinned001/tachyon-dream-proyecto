import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import type { Rol } from './Rol.model.js';

export class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare profile_image: CreationOptional<string | null>;
  declare dni: string;
  declare is_author: CreationOptional<boolean>;
  declare is_guest: CreationOptional<boolean>;
  declare active: boolean;
  declare recibirNotificaciones: CreationOptional<boolean>;
  declare registration_comments: CreationOptional<string | null>;
  declare credential_filename: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare approvedAt: CreationOptional<Date | null>;
  declare roleId: number;
  declare specialtyId: number | null;
  declare must_change_password: CreationOptional<boolean>;
  declare failed_login_attempts: CreationOptional<number>;
  declare locked_until: CreationOptional<Date | null>;
  declare role?: NonAttribute<Rol>;
}

export const initializeUsuarioModel = (sequelize: Sequelize): void => {
  Usuario.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      username: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      first_name: { type: DataTypes.STRING, allowNull: false },
      last_name: { type: DataTypes.STRING, allowNull: false },
      profile_image: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      dni: { type: DataTypes.STRING, allowNull: false },
      is_author: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_guest: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      active: { type: DataTypes.BOOLEAN, allowNull: false },
      recibirNotificaciones: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      registration_comments: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
      credential_filename: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'approved_at',
      },
      roleId: { type: DataTypes.INTEGER, allowNull: false },
      specialtyId: { type: DataTypes.INTEGER, allowNull: true },
      must_change_password: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      failed_login_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      locked_until: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: false,
      indexes: [
        {
          name: 'users_dni_unique',
          unique: true,
          fields: ['dni'],
        },
      ],
    },
  );
};

export { Usuario as UsuarioModel };
