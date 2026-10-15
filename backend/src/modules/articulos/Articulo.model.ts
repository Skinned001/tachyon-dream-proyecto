import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export type ArticleState =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'PUBLICADO';

export class Articulo extends Model<InferAttributes<Articulo>, InferCreationAttributes<Articulo>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare state: ArticleState;
  declare responsibleId: number;
  declare specialtyId: number;
  declare convocationId: number;
}

export const initializeArticuloModel = (sequelize: Sequelize): void => {
  Articulo.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      state: {
        type: DataTypes.ENUM('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO', 'PUBLICADO'),
        allowNull: false,
      },
      responsibleId: { type: DataTypes.INTEGER, allowNull: false },
      specialtyId: { type: DataTypes.INTEGER, allowNull: false },
      convocationId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, tableName: 'articles', timestamps: false },
  );
};

export { Articulo as ArticuloModel };
