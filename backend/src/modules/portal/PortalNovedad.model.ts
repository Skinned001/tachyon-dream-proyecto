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

export type PortalNovedadCategory =
  | 'NOVEDAD'
  | 'JORNADA'
  | 'COMUNICADO'
  | 'DESTACADO';

export class PortalNovedad extends Model<
  InferAttributes<PortalNovedad>,
  InferCreationAttributes<PortalNovedad>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare category: PortalNovedadCategory;
  declare summary: string;
  declare imageUrl: CreationOptional<string | null>;
  declare attachmentUrl: CreationOptional<string | null>;
  declare attachmentFileName: CreationOptional<string | null>;
  declare externalLink: CreationOptional<string | null>;
  declare isPublished: CreationOptional<boolean>;
  declare isPinned: CreationOptional<boolean>;
  declare createdBy: CreationOptional<number | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare creator?: NonAttribute<Usuario>;
}

export const initializePortalNovedadModel = (sequelize: Sequelize): void => {
  PortalNovedad.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      category: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'NOVEDAD',
      },
      summary: { type: DataTypes.TEXT, allowNull: false },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
      },
      attachmentUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
      },
      attachmentFileName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      externalLink: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isPinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      tableName: 'portal_novedades',
      timestamps: true,
    },
  );
};
