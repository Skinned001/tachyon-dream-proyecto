import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import type { Usuario } from '../usuarios/Usuario.model.js';

export class RevistaEdicion extends Model<
  InferAttributes<RevistaEdicion>,
  InferCreationAttributes<RevistaEdicion>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare editionLabel: string;
  declare summary: CreationOptional<string | null>;
  declare coverImageUrl: CreationOptional<string | null>;
  declare pdfUrl: string;
  declare pdfFileName: CreationOptional<string | null>;
  declare publishedDate: CreationOptional<Date>;
  declare isFeatured: CreationOptional<boolean>;
  declare isPublished: CreationOptional<boolean>;
  declare createdBy: CreationOptional<number | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare creator?: NonAttribute<Usuario>;
}

export const initializeRevistaEdicionModel = (sequelize: Sequelize): void => {
  RevistaEdicion.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      editionLabel: { type: DataTypes.STRING(100), allowNull: false },
      summary: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
      coverImageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
      },
      pdfUrl: { type: DataTypes.STRING(500), allowNull: false },
      pdfFileName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      publishedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'revista_ediciones',
      timestamps: true,
    },
  );
};
