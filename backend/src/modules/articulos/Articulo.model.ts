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
import type { ArticuloVersion } from './ArticuloVersion.model.js';

export type ArticleState =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'REVISION_MENOR'
  | 'REVISION_MAYOR'
  | 'PENDIENTE_DECISION'
  | 'APROBADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'PUBLICADO';

export class Articulo extends Model<
  InferAttributes<Articulo>,
  InferCreationAttributes<Articulo>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare summary: CreationOptional<string | null>;
  declare keywords: CreationOptional<string[] | null>;
  declare coauthors: CreationOptional<string[] | null>;
  declare state: ArticleState;
  declare responsibleId: number;
  declare specialtyId: number;
  declare convocationId: CreationOptional<number | null>;
  declare createdAt: CreationOptional<Date>;
  declare specialty?: NonAttribute<Especialidad>;
  declare versions?: NonAttribute<ArticuloVersion[]>;
}

export const initializeArticuloModel = (sequelize: Sequelize): void => {
  Articulo.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      summary: { type: DataTypes.TEXT, allowNull: true },
      keywords: { type: DataTypes.JSON, allowNull: true },
      coauthors: { type: DataTypes.JSON, allowNull: true },
      state: {
        type: DataTypes.ENUM(
          'BORRADOR',
          'PENDIENTE',
          'EN_REVISION',
          'REVISION_MENOR',
          'REVISION_MAYOR',
          'PENDIENTE_DECISION',
          'APROBADO',
          'ACEPTADO',
          'RECHAZADO',
          'PUBLICADO',
        ),
        allowNull: false,
      },
      responsibleId: { type: DataTypes.INTEGER, allowNull: false },
      specialtyId: { type: DataTypes.INTEGER, allowNull: false },
      convocationId: { type: DataTypes.INTEGER, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'articles',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
    },
  );
};

export { Articulo as ArticuloModel };
