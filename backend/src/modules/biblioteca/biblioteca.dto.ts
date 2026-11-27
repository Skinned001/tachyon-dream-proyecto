import type { RoleName } from '../auth/auth.dto.js';
import type { FavoriteTargetType } from './Favorito.model.js';
import type { ResourceVisibility } from './RecursoBiblioteca.model.js';

export type { FavoriteTargetType };
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
  description?: string | null;
  category: string;
  file_path: string;
  file_size: string;
  fileUrl?: string | null;
  fileName?: string | null;
  visibility: LibraryVisibility;
  uploadedBy: number | null;
  specialtyId: number | null;
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
  convocatoriaId?: number;
}

export interface LibraryListQuery extends LibraryResourceFilters {
  userRole?: RoleName;
}

export interface FavoriteItemDTO {
  id: number;
  targetType: FavoriteTargetType;
  targetId: number;
  title: string;
  category: string;
  area: string;
  fileUrl: string | null;
  createdAt: string;
}

export interface ToggleFavoriteResultDTO {
  saved: boolean;
  targetType: FavoriteTargetType;
  targetId: number;
}
