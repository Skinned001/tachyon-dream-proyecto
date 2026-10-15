export interface AsignacionComiteAttributes {
  id?: number;
  articleId: number;
  committeeId: number;
}

export class AsignacionComiteModel {
  static readonly tableName = 'asignaciones_comite';
}
