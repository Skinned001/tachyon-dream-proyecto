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
  specialtyId: number | null;
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
