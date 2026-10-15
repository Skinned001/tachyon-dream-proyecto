import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export class ArticuloVersion extends Model<
  InferAttributes<ArticuloVersion>,
  InferCreationAttributes<ArticuloVersion>
> {
  declare id: CreationOptional<number>;
  declare version_number: number;
  declare body_text: string;
  declare pdf_path: string;
  declare ai_report: CreationOptional<Record<string, unknown> | null>;
  declare articleId: number;
}

export const initializeArticuloVersionModel = (sequelize: Sequelize): void => {
  ArticuloVersion.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      version_number: { type: DataTypes.INTEGER, allowNull: false },
      body_text: { type: DataTypes.TEXT, allowNull: false },
      pdf_path: { type: DataTypes.STRING, allowNull: false },
      ai_report: { type: DataTypes.JSON, allowNull: true },
      articleId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, tableName: 'article_versions', timestamps: false },
  );
};

export { ArticuloVersion as ArticuloVersionModel };
