export interface NotificacionAttributes {
  id?: number;
  userId: number;
  message: string;
}

export class NotificacionModel {
  static readonly tableName = 'notificaciones';
}
