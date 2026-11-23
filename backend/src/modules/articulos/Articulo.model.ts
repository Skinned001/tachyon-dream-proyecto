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
import type { AsignacionComite } from '../editorial/AsignacionComite.model.js';
import type { Convocatoria } from '../editorial/Convocatoria.model.js';
import type { ArticuloVersion } from './ArticuloVersion.model.js';
import type { Usuario } from '../usuarios/Usuario.model.js';

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
  declare rejection_reason: CreationOptional<string | null>;
  declare publishedAt: CreationOptional<Date | null>;
  declare editionNumber: CreationOptional<string | null>;
  declare doi: CreationOptional<string | null>;
  declare state: ArticleState;
  declare responsibleId: number;
  declare specialtyId: number;
  declare convocationId: CreationOptional<number | null>;
  declare convocatoriaId: CreationOptional<number | null>;
  declare createdAt: CreationOptional<Date>;
  declare specialty?: NonAttribute<Especialidad>;
  declare versions?: NonAttribute<ArticuloVersion[]>;
  declare responsible?: NonAttribute<Usuario>;
  declare convocatoria?: NonAttribute<Convocatoria>;
  declare committeeAssignments?: NonAttribute<AsignacionComite[]>;
}

export const initializeArticuloModel = (sequelize: Sequelize): void => {
  Articulo.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      summary: { type: DataTypes.TEXT, allowNull: true },
      keywords: { type: DataTypes.JSON, allowNull: true },
      coauthors: { type: DataTypes.JSON, allowNull: true },
      rejection_reason: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
      publishedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
      editionNumber: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
      doi: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null },
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
      convocatoriaId: { type: DataTypes.INTEGER, allowNull: true },
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
