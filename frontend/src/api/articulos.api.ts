import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';

type ArticleState =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'REVISION_MENOR'
  | 'REVISION_MAYOR'
  | 'PENDIENTE_DECISION'
  | 'APROBADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'PUBLICADO';

interface ArticleVersion {
  version_number: number;
  body_text: string | null;
  pdf_path: string | null;
}

interface ArticleRecord {
  id: number;
  title: string;
  summary?: string;
  state: ArticleState;
  createdAt: string;
  versions?: ArticleVersion[];
}

export interface Articulo {
  id: number;
  title: string;
  abstract: string;
  status: ArticleState;
  fileUrl?: string;
  createdAt: string;
}

export interface PublishedArticle {
  id: number;
  title: string;
  summary?: string;
  keywords?: string[];
  coauthors?: string[];
  specialty?: { id: number; name: string };
  createdAt: string;
  pdfAvailable: boolean;
}

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const toArticulo = (article: ArticleRecord): Articulo => {
  const latestVersion = article.versions?.reduce<ArticleVersion | undefined>(
    (latest, version) =>
      !latest || version.version_number > latest.version_number ? version : latest,
    undefined,
  );

  return {
    id: article.id,
    title: article.title,
    abstract: article.summary ?? latestVersion?.body_text ?? '',
    status: article.state,
    fileUrl:
      article.state === 'PUBLICADO'
        ? `${apiBaseUrl}/articulos/publicados/${article.id}/pdf`
        : undefined,
    createdAt: article.createdAt,
  };
};

export const articulosApi = {
  list: () => axiosClient.get<ApiResponse<ArticleRecord[]>>('/articulos'),
  listPublished: async (): Promise<PublishedArticle[]> => {
    const response = await axiosClient.get<ApiResponse<PublishedArticle[]>>(
      '/articulos/publicados',
    );

    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error(
        response.data.error || 'No se pudo cargar el archivo público.',
      );
    }

    return response.data.data;
  },
};

export const getMisArticulos = async (): Promise<Articulo[]> => {
  const { data } = await articulosApi.list();
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error || 'No se pudieron cargar los artículos.');
  }
  return data.data.map(toArticulo);
};

export const subirManuscrito = async (formData: FormData): Promise<Articulo> => {
  const { data } = await axiosClient.post<ApiResponse<ArticleRecord>>(
    '/articulos',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo subir el manuscrito.');
  }

  return toArticulo(data.data);
};
