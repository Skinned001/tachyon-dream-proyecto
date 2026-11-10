import axiosClient from "./axiosClient";
import { getMisArticulos, type Articulo } from "./articulos.api";

export const especialistasMock = [
  { id: 101, nombre: "Dr. Roberto Fernández", especialidad: "Cardiología" },
  { id: 102, nombre: "Dra. Alicia Torres", especialidad: "Neurología" },
  { id: 103, nombre: "Dr. Carlos Mendoza", especialidad: "Salud Pública" },
];

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
