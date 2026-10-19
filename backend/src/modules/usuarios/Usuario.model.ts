import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export class Usuario extends Model<InferAttributes<Usuario>, InferCreationAttributes<Usuario>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare dni: string;
  declare active: boolean;
  declare roleId: number;
  declare specialtyId: number | null;
  declare must_change_password: CreationOptional<boolean>;
  declare failed_login_attempts: CreationOptional<number>;
  declare locked_until: CreationOptional<Date | null>;
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
      dni: { type: DataTypes.STRING, allowNull: false },
      active: { type: DataTypes.BOOLEAN, allowNull: false },
      roleId: { type: DataTypes.INTEGER, allowNull: false },
      specialtyId: { type: DataTypes.INTEGER, allowNull: true },
      must_change_password: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      failed_login_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      locked_until: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    },
    { sequelize, tableName: 'users', timestamps: false },
  );
};

export { Usuario as UsuarioModel };
