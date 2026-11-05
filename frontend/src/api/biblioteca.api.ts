import axiosClient from './axiosClient';

export interface RecursoBiblioteca {
  id: number;
  titulo: string;
  tipo: string;
  area: string;
  descripcion: string;
  archivoUrl: string;
  visibilidad: 'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL';
  createdAt: string;
  updatedAt: string;
}

export const getRecursosBiblioteca = async (): Promise<RecursoBiblioteca[]> => {
  const response = await axiosClient.get<{
    success: boolean;
    data?: RecursoBiblioteca[] | null;
  }>('/biblioteca');
  return response.data.data || [];
};
