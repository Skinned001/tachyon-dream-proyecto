import { axiosClient } from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export type LibraryResourceCategory =
  | 'MANUAL'
  | 'PROTOCOLO'
  | 'GUIA'
  | 'NORMATIVA'
  | 'OTRO';

export interface LibraryResource {
  id: number;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string;
  fileName: string | null;
  uploadedBy: number | null;
  uploader?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  createdAt: string;
  updatedAt: string | null;
}

export interface LibraryResourceFilters {
  category?: string;
  search?: string;
}

export interface CreateLibraryResourceInput {
  title: string;
  description?: string;
  category: LibraryResourceCategory;
  file: File;
}

export const getLibraryResources = async (
  filters: LibraryResourceFilters = {},
): Promise<LibraryResource[]> => {
  const { data } = await axiosClient.get<ApiResponse<LibraryResource[]>>(
    '/library-resources',
    { params: filters },
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error || 'No se pudieron cargar los documentos.');
  }
  return data.data;
};

export const createLibraryResource = async (
  input: CreateLibraryResourceInput,
): Promise<LibraryResource> => {
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('title', input.title);
  formData.append('category', input.category);
  if (input.description) {
    formData.append('description', input.description);
  }

  const { data } = await axiosClient.post<ApiResponse<LibraryResource>>(
    '/library-resources',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo subir el documento.');
  }
  return data.data;
};

export const deleteLibraryResource = async (id: number): Promise<void> => {
  const { data } = await axiosClient.delete<ApiResponse<{ message: string }>>(
    `/library-resources/${id}`,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo eliminar el documento.');
  }
};

export const getLibraryResourceFileUrl = (fileUrl: string): string => {
  const apiBaseUrl = axiosClient.defaults.baseURL ?? window.location.origin;
  const backendOrigin = new URL(apiBaseUrl, window.location.origin).origin;
  const relativeFileUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return new URL(relativeFileUrl, backendOrigin).toString();
};
