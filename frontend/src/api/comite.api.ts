<<<<<<< HEAD
import axiosClient from "./axiosClient";
import { getMisArticulos, type Articulo } from "./articulos.api";

export const getArticulosGenerales = async (): Promise<Articulo[]> => {
  return getMisArticulos();
};

// Modificado para aceptar un array de revisores
export const asignarRevisores = async (
  articuloId: number,
  revisoresIds: number[],
): Promise<any> => {
  // Contrato proyectado: el backend espera un array de IDs
  const response = await axiosClient.put(`/articulos/${articuloId}/asignar`, {
    revisoresIds,
  });
  return response.data;
};
=======
export {
  getArticulos as getArticulosGenerales,
  getRevisoresComite,
  asignarRevisoresComite as asignarRevisores,
  rechazarManuscritoDdi,
  type Articulo,
  type ReviewerCandidate,
} from './articulos.api';
>>>>>>> cdb5e53e838edcb56febd5aad3e51d1aa29df9d0
