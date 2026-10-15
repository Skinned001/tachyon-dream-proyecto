export interface ArticuloAttributes {
  id?: number;
  title: string;
  status?: string;
}

export class ArticuloModel {
  static readonly tableName = 'articulos';
}
