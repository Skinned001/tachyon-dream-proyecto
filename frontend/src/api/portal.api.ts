import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export type PortalNovedadCategory =
  | 'NOVEDAD'
  | 'JORNADA'
  | 'COMUNICADO'
  | 'DESTACADO';

export interface RevistaEdicion {
  id: number;
  title: string;
  editionLabel: string;
  summary: string | null;
  coverImageUrl: string | null;
  pdfUrl: string;
  pdfFileName: string | null;
  publishedDate: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface PortalNovedad {
  id: number;
  title: string;
  category: PortalNovedadCategory;
  summary: string;
  imageUrl: string | null;
  attachmentUrl: string | null;
  attachmentFileName: string | null;
  externalLink: string | null;
  isPublished: boolean;
  isPinned: boolean;
  createdAt: string;
}

export interface PortalPublicContent {
  featuredEdition: RevistaEdicion | null;
  pastEditions: RevistaEdicion[];
  news: PortalNovedad[];
}

export const getPortalFileUrl = (fileUrl: string | null | undefined): string => {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const apiBaseUrl = axiosClient.defaults.baseURL ?? window.location.origin;
  const backendOrigin = new URL(apiBaseUrl, window.location.origin).origin;
  const relative = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return new URL(relative, backendOrigin).toString();
};

export const getPortalPublicContent = async (): Promise<PortalPublicContent> => {
  const { data } = await axiosClient.get<ApiResponse<PortalPublicContent>>(
    '/portal/public',
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo cargar el contenido del portal.');
  }
  return data.data;
};

export const getRevistasAdmin = async (): Promise<RevistaEdicion[]> => {
  const { data } = await axiosClient.get<ApiResponse<RevistaEdicion[]>>(
    '/portal/revistas',
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error || 'No se pudieron cargar las ediciones.');
  }
  return data.data;
};

export const createRevistaEdicion = async (input: {
  title: string;
  editionLabel: string;
  summary?: string;
  publishedDate?: string;
  isFeatured: boolean;
  isPublished: boolean;
  pdf: File;
  cover?: File | null;
}): Promise<RevistaEdicion> => {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('editionLabel', input.editionLabel);
  if (input.summary) formData.append('summary', input.summary);
  if (input.publishedDate) formData.append('publishedDate', input.publishedDate);
  formData.append('isFeatured', String(input.isFeatured));
  formData.append('isPublished', String(input.isPublished));
  formData.append('pdf', input.pdf);
  if (input.cover) formData.append('cover', input.cover);

  const { data } = await axiosClient.post<ApiResponse<RevistaEdicion>>(
    '/portal/revistas',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo publicar la edición.');
  }
  return data.data;
};

export const updateRevistaEdicion = async (
  id: number,
  payload: Partial<{
    title: string;
    editionLabel: string;
    summary: string | null;
    isFeatured: boolean;
    isPublished: boolean;
  }>,
): Promise<RevistaEdicion> => {
  const { data } = await axiosClient.patch<ApiResponse<RevistaEdicion>>(
    `/portal/revistas/${id}`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo actualizar la edición.');
  }
  return data.data;
};

export const deleteRevistaEdicion = async (id: number): Promise<void> => {
  const { data } = await axiosClient.delete<ApiResponse<{ message: string }>>(
    `/portal/revistas/${id}`,
  );
  if (!data.success) {
    throw new Error(data.error || 'No se pudo eliminar la edición.');
  }
};

export const getNovedadesAdmin = async (): Promise<PortalNovedad[]> => {
  const { data } = await axiosClient.get<ApiResponse<PortalNovedad[]>>(
    '/portal/novedades',
  );
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(data.error || 'No se pudieron cargar las novedades.');
  }
  return data.data;
};

export const createPortalNovedad = async (input: {
  title: string;
  category: PortalNovedadCategory;
  summary: string;
  externalLink?: string;
  isPublished: boolean;
  isPinned: boolean;
  image?: File | null;
  attachment?: File | null;
}): Promise<PortalNovedad> => {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('category', input.category);
  formData.append('summary', input.summary);
  if (input.externalLink) formData.append('externalLink', input.externalLink);
  formData.append('isPublished', String(input.isPublished));
  formData.append('isPinned', String(input.isPinned));
  if (input.image) formData.append('image', input.image);
  if (input.attachment) formData.append('attachment', input.attachment);

  const { data } = await axiosClient.post<ApiResponse<PortalNovedad>>(
    '/portal/novedades',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo crear la publicación.');
  }
  return data.data;
};

export const updatePortalNovedad = async (
  id: number,
  payload: Partial<{
    title: string;
    category: PortalNovedadCategory;
    summary: string;
    externalLink: string | null;
    isPublished: boolean;
    isPinned: boolean;
  }>,
): Promise<PortalNovedad> => {
  const { data } = await axiosClient.patch<ApiResponse<PortalNovedad>>(
    `/portal/novedades/${id}`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error || 'No se pudo actualizar la publicación.');
  }
  return data.data;
};

export const deletePortalNovedad = async (id: number): Promise<void> => {
  const { data } = await axiosClient.delete<ApiResponse<{ message: string }>>(
    `/portal/novedades/${id}`,
  );
  if (!data.success) {
    throw new Error(data.error || 'No se pudo eliminar la publicación.');
  }
};
