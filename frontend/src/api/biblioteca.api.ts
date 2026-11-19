import axiosClient from './axiosClient';
import type { PublishedArticle } from './articulos.api';

export interface RecursoBiblioteca {
  id: number;
  titulo: string;
  tipo: string;
  area: string;
  descripcion: string;
  archivoUrl: string;
  visibilidad: 'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL';
  createdAt: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LibraryResourceDTO {
  id: number;
  title: string;
  category: string;
  file_path: string;
  file_size: string;
  visibility: RecursoBiblioteca['visibilidad'];
  specialtyId: number;
  specialty?: { id: number; name: string };
  createdAt: string;
}

const apiBaseUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
).replace(/\/$/, '');
const serverBaseUrl = apiBaseUrl.replace(/\/api$/i, '');

const getUploadedFileUrl = (filePath: string): string => {
  const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${serverBaseUrl}/${normalizedPath}`;
};

const toLibraryResource = (
  resource: LibraryResourceDTO,
): RecursoBiblioteca => ({
  id: resource.id,
  titulo: resource.title,
  tipo: resource.category,
  area: resource.specialty?.name ?? '',
  descripcion: '',
  archivoUrl: getUploadedFileUrl(resource.file_path),
  visibilidad: resource.visibility,
  createdAt: resource.createdAt,
});

const toPublishedArticleResource = (
  article: PublishedArticle,
): RecursoBiblioteca => ({
  id: article.id,
  titulo: article.title,
  tipo: 'Artículo publicado',
  area: article.specialty?.name ?? '',
  descripcion: article.summary ?? '',
  archivoUrl: article.pdfAvailable
    ? `${apiBaseUrl}/articulos/publicados/${article.id}/pdf`
    : '',
  visibilidad: 'PUBLICO',
  createdAt: article.createdAt,
});

export const getRecursosBiblioteca = async (
  convocatoriaId?: number,
): Promise<RecursoBiblioteca[]> => {
  if (convocatoriaId !== undefined) {
    const { data } = await axiosClient.get<ApiResponse<PublishedArticle[]>>(
      '/biblioteca',
      { params: { convocatoriaId } },
    );
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(data.error ?? 'No se pudieron cargar los artículos publicados.');
    }
    return data.data.map(toPublishedArticleResource);
  }

  const { data } = await axiosClient.get<ApiResponse<LibraryResourceDTO[]>>(
    '/biblioteca',
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error ?? 'No se pudieron cargar los recursos de la biblioteca.');
  }
  return data.data.map(toLibraryResource);
};
