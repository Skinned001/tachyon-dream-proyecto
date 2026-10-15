export interface UsuarioAttributes {
  id?: number;
  name: string;
  email: string;
}

export class UsuarioModel {
  static readonly tableName = 'usuarios';
}
