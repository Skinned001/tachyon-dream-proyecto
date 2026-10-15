export interface RolAttributes {
  id?: number;
  name: string;
}

export class RolModel {
  static readonly tableName = 'roles';
}
