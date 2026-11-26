export interface LibraryResourceUploaderDTO {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface InstitutionalLibraryResourceDTO {
  id: number;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string;
  fileName: string | null;
  uploadedBy: number | null;
  uploader?: LibraryResourceUploaderDTO;
  specialtyId: number | null;
  specialty?: { id: number; name: string } | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateInstitutionalLibraryResourceInput {
  title: string;
  description?: string;
  category: string;
  specialtyId?: number | null;
}

export interface InstitutionalLibraryResourceFilters {
  category?: string;
  search?: string;
}
