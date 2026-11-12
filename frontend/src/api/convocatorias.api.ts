import axiosClient from './axiosClient';

export interface Convocatoria {
  id?: number;
  titulo: string;
  tematica: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'ABIERTA' | 'CERRADA' | 'EN_EVALUACION' | 'PUBLICADA';
}

export const getConvocatorias = async (): Promise<Convocatoria[]> => {
  // Descomentar cuando el backend esté listo
  // const response = await axiosClient.get('/convocatorias');
  // return response.data.data;

  // Mock temporal
  return [
    {
      id: 1,
      titulo: 'Volumen 2, Número 2',
      tematica: 'Avances en Telemedicina',
      fechaInicio: '2026-05-01',
      fechaFin: '2026-07-31',
      estado: 'ABIERTA',
    },
  ];
};

export const crearConvocatoria = async (
  data: Partial<Convocatoria>,
): Promise<any> => {
  // const response = await axiosClient.post('/convocatorias', data);
  // return response.data;
  return { success: true };
};

export const cerrarConvocatoria = async (
  id: number,
  passwordConfirmacion: string,
): Promise<any> => {
  // const response = await axiosClient.patch(`/convocatorias/${id}/cerrar`, {
  //   password: passwordConfirmacion,
  // });
  // return response.data;
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (passwordConfirmacion !== 'admin123') {
    throw new Error('Contraseña incorrecta');
  }
  return { success: true };
};
