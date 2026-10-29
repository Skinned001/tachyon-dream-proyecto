import type { RoleName } from '../auth/auth.dto.js';
import type { ResourceVisibility } from './RecursoBiblioteca.model.js';

export type LibraryVisibility = ResourceVisibility;

export interface LibrarySpecialtyDTO {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface LibraryResourceDTO {
  id: number;
  title: string;
  category: string;
  file_path: string;
  file_size: string;
  visibility: LibraryVisibility;
  uploadedBy: number;
  specialtyId: number;
  specialty?: LibrarySpecialtyDTO;
  createdAt: string;
}

export interface CreateLibraryResourceRequest {
  title: string;
  category: string;
  visibility: LibraryVisibility;
  specialtyId: number;
}

export interface UpdateLibraryResourceRequest {
  title?: string;
  category?: string;
  visibility?: LibraryVisibility;
  specialtyId?: number;
}

export interface LibraryResourceFilters {
  specialtyId?: number;
  category?: string;
  search?: string;
}

export interface LibraryListQuery extends LibraryResourceFilters {
  userRole?: RoleName;
}
