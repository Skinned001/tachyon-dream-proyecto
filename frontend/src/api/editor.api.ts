import axiosClient from './axiosClient';
import { type Articulo } from './articulos.api';

export const getArticulosAsignados = async (): Promise<Articulo[]> => {
  // El backend devolverá solo los artículos derivados a este usuario (EDITOR)
  const response = await axiosClient.get('/articulos/asignados');
  return response.data.data || [];
};

export const enviarDictamen = async (articuloId: number, dictamen: string, comentarios: string): Promise<any> => {
  // Contrato proyectado para registrar la evaluación
  const response = await axiosClient.post(`/articulos/${articuloId}/dictamen`, { dictamen, comentarios });
  return response.data;
};