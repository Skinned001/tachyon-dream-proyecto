export interface RevisionAttributes {
  id?: number;
  articleId: number;
  status: string;
}

export class RevisionModel {
  static readonly tableName = 'revisiones';
}
