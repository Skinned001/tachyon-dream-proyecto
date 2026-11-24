export type UserRole = 'STAFF' | 'DDI' | 'COMITE' | 'EDITOR' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image?: string | null;
  role: UserRole;
  is_author: boolean;
  is_guest?: boolean;
<<<<<<< HEAD
  specialtyId?: number | null;
=======
  recibirNotificaciones?: boolean;
  specialtyId: number | null;
>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0
  must_change_password: boolean;
  dni?: string | null;
  active: boolean;
  createdAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_author: boolean;
  is_guest?: boolean;
  specialtyId?: number | null;
  dni?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_author?: boolean;
  is_guest?: boolean;
  specialtyId?: number | null;
  dni?: string;
  active?: boolean;
}
