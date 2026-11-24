import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import type { Especialidad } from '../especialidades/Especialidad.model.js';
import type { Usuario } from '../usuarios/Usuario.model.js';

export type ResourceVisibility = 'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL';

export class RecursoBiblioteca extends Model<
  InferAttributes<RecursoBiblioteca>,
  InferCreationAttributes<RecursoBiblioteca>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare category: string;
  declare file_path: string;
  declare file_size: string;
  declare visibility: ResourceVisibility;
  declare fileUrl: CreationOptional<string | null>;
  declare fileName: CreationOptional<string | null>;
  declare uploadedBy: CreationOptional<number | null>;
  declare specialtyId: CreationOptional<number | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date | null>;
  declare specialty?: NonAttribute<Especialidad>;
  declare uploader?: NonAttribute<Usuario>;
}

export const initializeRecursoBibliotecaModel = (sequelize: Sequelize): void => {
  RecursoBiblioteca.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
      category: { type: DataTypes.STRING, allowNull: false },
      file_path: { type: DataTypes.STRING, allowNull: false },
      file_size: { type: DataTypes.STRING, allowNull: false },
      fileUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      fileName: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
      visibility: {
        type: DataTypes.ENUM('PUBLICO', 'INTERNO', 'CONFIDENCIAL'),
        allowNull: false,
        defaultValue: 'PUBLICO',
      },
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      specialtyId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'library_resources',
      timestamps: true,
      createdAt: 'createdAt',
    },
  );
};

export { RecursoBiblioteca as RecursoBibliotecaModel };
