export interface RecursoBibliotecaAttributes {
  id?: number;
  title: string;
  fileUrl?: string;
}

export class RecursoBibliotecaModel {
  static readonly tableName = 'recursos_biblioteca';
}
