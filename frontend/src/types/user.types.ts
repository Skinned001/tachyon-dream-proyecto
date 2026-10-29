export type UserRole = 'AUTOR' | 'DDI' | 'COMITE' | 'PUBLISHER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  specialtyId: number | null;
  must_change_password: boolean;
  // Campos opcionales que vienen en UserDTO
  dni?: string | null;
  active?: boolean;
  createdAt?: string;
}
