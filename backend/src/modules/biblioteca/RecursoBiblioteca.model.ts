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

export type ResourceVisibility = 'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL';

export class RecursoBiblioteca extends Model<
  InferAttributes<RecursoBiblioteca>,
  InferCreationAttributes<RecursoBiblioteca>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare category: string;
  declare file_path: string;
  declare file_size: string;
  declare visibility: ResourceVisibility;
  declare uploadedBy: number;
  declare specialtyId: number;
  declare createdAt: CreationOptional<Date>;
  declare specialty?: NonAttribute<Especialidad>;
}

export const initializeRecursoBibliotecaModel = (sequelize: Sequelize): void => {
  RecursoBiblioteca.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.STRING, allowNull: false },
      file_path: { type: DataTypes.STRING, allowNull: false },
      file_size: { type: DataTypes.STRING, allowNull: false },
      visibility: {
        type: DataTypes.ENUM('PUBLICO', 'INTERNO', 'CONFIDENCIAL'),
        allowNull: false,
      },
      uploadedBy: { type: DataTypes.INTEGER, allowNull: false },
      specialtyId: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'library_resources',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
    },
  );
};

export { RecursoBiblioteca as RecursoBibliotecaModel };
