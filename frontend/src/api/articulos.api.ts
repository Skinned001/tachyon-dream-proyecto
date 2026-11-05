import { axiosClient } from './axiosClient';

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

export const articulosApi = {
  list: () => axiosClient.get('/articulos'),
  listPublished: async (): Promise<PublishedArticle[]> => {
    const response = await axiosClient.get<{
      success: boolean;
      data?: PublishedArticle[];
      error?: string;
    }>('/articulos/publicados');

    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error(response.data.error || 'No se pudo cargar el archivo público.');
    }

    return response.data.data;
  },
};
