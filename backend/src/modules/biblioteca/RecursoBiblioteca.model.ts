import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export type ResourceVisibility = 'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL';

export class RecursoBiblioteca extends Model<
  InferAttributes<RecursoBiblioteca>,
  InferCreationAttributes<RecursoBiblioteca>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare category: string;
  declare file_path: string;
  declare file_size: number;
  declare visibility: ResourceVisibility;
  declare uploadedBy: number;
  declare specialtyId: number;
}

export const initializeRecursoBibliotecaModel = (sequelize: Sequelize): void => {
  RecursoBiblioteca.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.STRING, allowNull: false },
      file_path: { type: DataTypes.STRING, allowNull: false },
      file_size: { type: DataTypes.INTEGER, allowNull: false },
      visibility: {
        type: DataTypes.ENUM('PUBLICO', 'INTERNO', 'CONFIDENCIAL'),
        allowNull: false,
      },
      uploadedBy: { type: DataTypes.INTEGER, allowNull: false },
      specialtyId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, tableName: 'library_resources', timestamps: false },
  );
};

export { RecursoBiblioteca as RecursoBibliotecaModel };
