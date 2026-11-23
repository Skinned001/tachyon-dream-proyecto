import axiosClient from './axiosClient';
import { articulosApi, type PublishedArticle } from './articulos.api';

export interface RecursoBiblioteca {
  id: number;
  source: 'recurso' | 'articulo';
  titulo: string;
  tipo: string;
  area: string;
  autor?: string;
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
  description?: string | null;
  category: string;
  file_path: string;
  file_size: string;
  fileUrl?: string | null;
  visibility: RecursoBiblioteca['visibilidad'];
  specialtyId: number | null;
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
  source: 'recurso',
  titulo: resource.title,
  tipo: resource.category,
  area: resource.specialty?.name ?? '',
  descripcion: resource.description ?? '',
  archivoUrl: resource.fileUrl
    ? `${serverBaseUrl}${resource.fileUrl.startsWith('/') ? '' : '/'}${resource.fileUrl}`
    : getUploadedFileUrl(resource.file_path),
  visibilidad: resource.visibility,
  createdAt: resource.createdAt,
});

const toPublishedArticleResource = (
  article: PublishedArticle,
): RecursoBiblioteca => ({
  id: article.id,
  source: 'articulo',
  titulo: article.title,
  tipo: 'Artículo publicado',
  area: article.specialty?.name ?? '',
  autor: [article.authorName, ...(article.coauthors ?? [])]
    .filter(Boolean)
    .join(' · '),
  descripcion: article.summary ?? '',
  archivoUrl: article.pdfAvailable
    ? `${apiBaseUrl}/articulos/publicados/${article.id}/pdf`
    : '',
  visibilidad: 'PUBLICO',
  createdAt: article.publishedAt ?? article.createdAt,
});

export type FavoriteTargetType = 'ARTICULO' | 'RECURSO';

export interface FavoriteItem {
  id: number;
  targetType: FavoriteTargetType;
  targetId: number;
  title: string;
  category: string;
  area: string;
  fileUrl: string | null;
  createdAt: string;
}

export interface ToggleFavoriteResult {
  saved: boolean;
  targetType: FavoriteTargetType;
  targetId: number;
}

export const getFavoriteKey = (
  targetType: FavoriteTargetType,
  targetId: number,
): string => `${targetType}:${targetId}`;

const GUEST_FAVORITES_STORAGE_KEY = 'hief_guest_favorites';

export const readGuestFavorites = (): string[] => {
  try {
    const raw = window.localStorage.getItem(GUEST_FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

export const writeGuestFavorites = (keys: string[]): void => {
  try {
    window.localStorage.setItem(
      GUEST_FAVORITES_STORAGE_KEY,
      JSON.stringify(keys),
    );
  } catch {
    // Ignore storage quota errors in private browsing modes.
  }
};

export const resolveFavoriteFileUrl = (fileUrl: string | null): string | null => {
  if (!fileUrl) return null;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${serverBaseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
};

export const getFavoritosBiblioteca = async (): Promise<FavoriteItem[]> => {
  const { data } = await axiosClient.get<ApiResponse<FavoriteItem[]>>(
    '/biblioteca/favoritos',
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error ?? 'No se pudieron cargar tus favoritos.');
  }
  return data.data.map((item) => ({
    ...item,
    fileUrl: resolveFavoriteFileUrl(item.fileUrl),
  }));
};

export const toggleFavoritoBiblioteca = async (
  targetType: FavoriteTargetType,
  targetId: number,
): Promise<ToggleFavoriteResult> => {
  const { data } = await axiosClient.post<ApiResponse<ToggleFavoriteResult>>(
    '/biblioteca/favoritos/toggle',
    { targetType, targetId },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error ?? 'No se pudo actualizar tus guardados.');
  }
  return data.data;
};

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

  const [resourcesRes, publishedArticles] = await Promise.all([
    axiosClient.get<ApiResponse<LibraryResourceDTO[]>>('/biblioteca'),
    articulosApi.listPublished(),
  ]);

  if (!resourcesRes.data.success || !Array.isArray(resourcesRes.data.data)) {
    throw new Error(
      resourcesRes.data.error ?? 'No se pudieron cargar los recursos de la biblioteca.',
    );
  }

  const combined = [
    ...publishedArticles.map(toPublishedArticleResource),
    ...resourcesRes.data.data.map(toLibraryResource),
  ];

  return combined.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};
