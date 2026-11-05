import axiosClient from './axiosClient';

export interface Articulo {
  id: number;
  title: string;
  abstract: string;
  status: 'BORRADOR' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'PUBLICADO';
  fileUrl: string;
  createdAt: string;
}

export const getMisArticulos = async (): Promise<Articulo[]> => {
  const response = await axiosClient.get('/articulos');
  return response.data.data || [];
};

export const subirManuscrito = async (formData: FormData): Promise<any> => {
  const token = localStorage.getItem('token');
  
  // Usamos fetch nativo para aislar el problema y evitar que Axios interfiera con los headers
  const response = await fetch('http://localhost:3000/api/articulos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // IMPORTANTE: NUNCA se pone Content-Type con fetch y FormData
    },
    body: formData
  });

  const data = await response.json();
  
  if (!response.ok) {
    // Simulamos la estructura de error de Axios para no romper tu página MisArticulos.tsx
    throw { response: { data } }; 
  }
  
  return data;
};