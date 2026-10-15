export interface ArticuloVersionAttributes {
  id?: number;
  articleId: number;
  version: number;
}

export class ArticuloVersionModel {
  static readonly tableName = 'articulo_versiones';
}
