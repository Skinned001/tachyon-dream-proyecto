import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export type ArticleState =
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

export type ReviewVerdict =
  | 'APROBAR'
  | 'APROBAR_CON_CORRECCIONES'
  | 'RECHAZAR';

export interface AIReport {
  plagiarismPercentage: number;
  similarityScore: number;
  checklistPassed: boolean;
  observations: string[];
  analyzedAt: string;
}

export interface ArticleReview {
  id: number;
  assignmentId: number;
  versionId: number;
  verdict: ReviewVerdict;
  comments: string;
  observations: string[];
  reviewerLabel: string;
  reviewerName?: string;
  isOwnReview?: boolean;
  createdAt: string;
}

export interface ArticleAssignment {
  id: number;
  reviewerLabel: string;
  reviewerId?: number;
  reviewerName?: string;
  read_status: boolean;
  hasReviewedLatest: boolean;
}

export interface ArticleVersion {
  id: number;
  articleId: number;
  version_number: number;
  body_text: string | null;
  pdf_path: string | null;
  ai_report: AIReport | null;
  reviews: ArticleReview[];
  createdAt: string;
}

export interface ReviewerCandidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialtyId: number | null;
  specialtyName: string | null;
}

interface ArticleRecord {
  id: number;
  title: string;
  summary?: string;
  keywords?: string[];
  coauthors?: string[];
  rejection_reason?: string | null;
  publishedAt?: string | null;
  editionNumber?: string | null;
  doi?: string | null;
  state: ArticleState;
  responsibleId: number;
  authorName?: string;
  specialtyId: number;
  convocatoriaId: number | null;
  convocatoria?: { id: number; title: string };
  specialty?: { id: number; name: string };
  versions?: ArticleVersion[];
  assignments?: ArticleAssignment[];
  currentUserAssignment?: {
    id: number;
    read_status: boolean;
    hasReviewedLatest: boolean;
  };
  createdAt: string;
}

export interface Articulo {
  id: number;
  title: string;
  abstract: string;
  status: ArticleState;
  keywords: string[];
  coauthors: string[];
  rejectionReason: string | null;
  publishedAt: string | null;
  editionNumber: string | null;
  doi: string | null;
  authorName: string | null;
  specialtyName: string | null;
  convocatoriaTitle: string | null;
  versions: ArticleVersion[];
  latestVersion: ArticleVersion | null;
  assignments: ArticleAssignment[];
  currentUserAssignment?: {
    id: number;
    read_status: boolean;
    hasReviewedLatest: boolean;
  };
  fileUrl?: string;
  createdAt: string;
}

export interface PublishedArticle {
  id: number;
  title: string;
  summary?: string;
  keywords?: string[];
  authorName?: string;
  coauthors?: string[];
  publishedAt?: string | null;
  editionNumber?: string | null;
  doi?: string | null;
  specialty?: { id: number; name: string };
  createdAt: string;
  pdfAvailable: boolean;
}

export interface SubmitVerdictPayload {
  verdict: ReviewVerdict;
  comments: string;
  observations?: string[];
}

export interface PublishArticlePayload {
  editionNumber?: string;
  doi?: string;
  keywords?: string[];
}

export interface WithdrawArticlePayload {
  reason: string;
  password: string;
}

const apiBaseUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
).replace(/\/$/, '');

export const getArticuloPdfUrl = (
  articleId: number,
  versionId?: number,
): string =>
  versionId !== undefined
    ? `${apiBaseUrl}/articulos/${articleId}/versions/${versionId}/pdf`
    : `${apiBaseUrl}/articulos/${articleId}/pdf`;

const toArticulo = (article: ArticleRecord): Articulo => {
  const sortedVersions = [...(article.versions ?? [])].sort(
    (a, b) => b.version_number - a.version_number,
  );
  const latestVersion = sortedVersions[0] ?? null;

  return {
    id: article.id,
    title: article.title,
    abstract: article.summary ?? latestVersion?.body_text ?? '',
    status: article.state,
    keywords: Array.isArray(article.keywords) ? article.keywords : [],
    coauthors: Array.isArray(article.coauthors) ? article.coauthors : [],
    rejectionReason: article.rejection_reason ?? null,
    publishedAt: article.publishedAt ?? null,
    editionNumber: article.editionNumber ?? null,
    doi: article.doi ?? null,
    authorName: article.authorName ?? null,
    specialtyName: article.specialty?.name ?? null,
    convocatoriaTitle: article.convocatoria?.title ?? null,
    versions: sortedVersions,
    latestVersion,
    assignments: Array.isArray(article.assignments) ? article.assignments : [],
    currentUserAssignment: article.currentUserAssignment,
    fileUrl: latestVersion?.pdf_path
      ? getArticuloPdfUrl(article.id, latestVersion.id)
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

export const getArticulos = async (): Promise<Articulo[]> => {
  const { data } = await articulosApi.list();
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error || 'No se pudieron cargar los artículos.');
  }
  return data.data.map(toArticulo);
};

export const getMisArticulos = getArticulos;

export const getRevisoresComite = async (): Promise<ReviewerCandidate[]> => {
  const { data } = await axiosClient.get<ApiResponse<ReviewerCandidate[]>>(
    '/articulos/revisores',
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(
      data.error || 'No se pudieron cargar los revisores del Comité.',
    );
  }
  return data.data;
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

export const subirVersionCorregida = async (
  articleId: number,
  formData: FormData,
): Promise<Articulo> => {
  const { data } = await axiosClient.post<ApiResponse<ArticleRecord>>(
    `/articulos/${articleId}/versiones`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo subir la versión corregida.');
  }

  return toArticulo(data.data);
};

export const rechazarManuscritoDdi = async (
  articleId: number,
  reason: string,
): Promise<Articulo> => {
  const { data } = await axiosClient.patch<ApiResponse<ArticleRecord>>(
    `/articulos/${articleId}/rechazar-ddi`,
    { reason },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo rechazar el manuscrito.');
  }
  return toArticulo(data.data);
};

export const asignarRevisoresComite = async (
  articleId: number,
  reviewerIds: number[],
): Promise<Articulo> => {
  const { data } = await axiosClient.put<ApiResponse<ArticleRecord>>(
    `/articulos/${articleId}/asignar`,
    { reviewerIds },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudieron asignar los revisores.');
  }
  return toArticulo(data.data);
};

export const emitirDictamenComite = async (
  articleId: number,
  payload: SubmitVerdictPayload,
): Promise<Articulo> => {
  const { data } = await axiosClient.post<ApiResponse<ArticleRecord>>(
    `/articulos/${articleId}/dictamen`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo registrar el dictamen.');
  }
  return toArticulo(data.data);
};

export const aprobarCorreccionEditorial = async (
  articleId: number,
): Promise<Articulo> => {
  const { data } = await axiosClient.post<ApiResponse<ArticleRecord>>(
    `/articulos/${articleId}/aprobar-correccion`,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo aprobar la versión corregida.');
  }
  return toArticulo(data.data);
};

export const publicarArticulo = async (
  articleId: number,
  payload: PublishArticlePayload = {},
): Promise<Articulo> => {
  const { data } = await axiosClient.patch<ApiResponse<ArticleRecord>>(
    `/articulos/${articleId}/publicar`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo publicar el manuscrito.');
  }
  return toArticulo(data.data);
};

export const retirarArticulo = async (
  articleId: number,
  payload: WithdrawArticlePayload,
): Promise<Articulo> => {
  const { data } = await axiosClient.patch<ApiResponse<ArticleRecord>>(
    `/articulos/${articleId}/retirar`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo retirar la publicación.');
  }
  return toArticulo(data.data);
};
