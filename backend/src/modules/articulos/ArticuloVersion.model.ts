import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';
import type { AIReportDTO } from './articulo.dto.js';

export class ArticuloVersion extends Model<
  InferAttributes<ArticuloVersion>,
  InferCreationAttributes<ArticuloVersion>
> {
  declare id: CreationOptional<number>;
  declare version_number: number;
  declare body_text: string | null;
  declare pdf_path: string | null;
  declare ai_report: CreationOptional<AIReportDTO | null>;
  declare articleId: number;
  declare createdAt: CreationOptional<Date>;
}

export const initializeArticuloVersionModel = (sequelize: Sequelize): void => {
  ArticuloVersion.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      version_number: { type: DataTypes.INTEGER, allowNull: false },
      body_text: { type: DataTypes.TEXT, allowNull: true },
      pdf_path: { type: DataTypes.STRING, allowNull: true },
      ai_report: { type: DataTypes.JSON, allowNull: true },
      articleId: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'article_versions',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
    },
  );
};

export { ArticuloVersion as ArticuloVersionModel };
