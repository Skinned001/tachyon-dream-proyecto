import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize';

export type FavoriteTargetType = 'ARTICULO' | 'RECURSO';

export class Favorito extends Model<
  InferAttributes<Favorito>,
  InferCreationAttributes<Favorito>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare targetType: FavoriteTargetType;
  declare targetId: number;
  declare createdAt: CreationOptional<Date>;
}

export const initializeFavoritoModel = (sequelize: Sequelize): void => {
  Favorito.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      targetType: {
        type: DataTypes.ENUM('ARTICULO', 'RECURSO'),
        allowNull: false,
      },
      targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'user_favorites',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ['userId', 'targetType', 'targetId'],
        },
      ],
    },
  );
};

export { Favorito as FavoritoModel };
