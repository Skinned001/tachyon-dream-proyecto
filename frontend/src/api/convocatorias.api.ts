import axiosClient from './axiosClient';

export type EstadoConvocatoria =
  | 'BORRADOR'
  | 'PROGRAMADA'
  | 'ABIERTA'
  | 'CERRADA';

export interface Convocatoria {
  id: number;
  title: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoConvocatoria;
  visibleEnLanding: boolean;
}

export interface CrearConvocatoriaRequest {
  title: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'BORRADOR' | 'PROGRAMADA';
  visibleEnLanding: boolean;
}

export interface EditarConvocatoriaRequest {
  title?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoConvocatoria;
  visibleEnLanding?: boolean;
  password: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ConvocatoriaCerrada extends Convocatoria {
  articulosPublicadosCount: number;
}

export interface ConvocatoriasPublicas {
  abiertas: Convocatoria[];
  proximas: Convocatoria[];
  cerradas: ConvocatoriaCerrada[];
}

interface PublicConvocatoriasResponse {
  abiertas?: unknown;
  proximas?: unknown;
  cerradas?: unknown;
}

const isConvocatoria = (value: unknown): value is Convocatoria => {
  if (typeof value !== 'object' || value === null) return false;
  const convocatoria = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(convocatoria.id) &&
    typeof convocatoria.title === 'string' &&
    typeof convocatoria.fechaInicio === 'string' &&
    typeof convocatoria.fechaFin === 'string' &&
    ['BORRADOR', 'PROGRAMADA', 'ABIERTA', 'CERRADA'].includes(
      String(convocatoria.estado),
    ) &&
    typeof convocatoria.visibleEnLanding === 'boolean'
  );
};

const normalizeConvocatorias = (value: unknown): Convocatoria[] =>
  Array.isArray(value) ? value.filter(isConvocatoria) : [];

const normalizeClosedConvocatorias = (
  value: unknown,
): ConvocatoriaCerrada[] =>
  Array.isArray(value)
    ? value
        .filter(
          (item): item is Convocatoria & { articulosPublicadosCount?: unknown } =>
            isConvocatoria(item) && item.estado === 'CERRADA',
        )
        .map((convocatoria) => ({
          ...convocatoria,
          articulosPublicadosCount:
            typeof convocatoria.articulosPublicadosCount === 'number'
              ? convocatoria.articulosPublicadosCount
              : 0,
        }))
    : [];

export const getConvocatoriasPublicas = async (): Promise<ConvocatoriasPublicas> => {
  const { data } = await axiosClient.get<
    ApiResponse<PublicConvocatoriasResponse | unknown[]>
  >('/convocatorias/publicas');
  if (!data.success) {
    throw new Error(data.error ?? 'No se pudieron cargar las convocatorias.');
  }
  if (Array.isArray(data.data)) {
    const convocatorias = normalizeConvocatorias(data.data);
    return {
      abiertas: convocatorias.filter(({ estado }) => estado === 'ABIERTA'),
      proximas: convocatorias.filter(
        ({ estado, visibleEnLanding }) =>
          estado === 'PROGRAMADA' && visibleEnLanding,
      ),
      cerradas: normalizeClosedConvocatorias(data.data),
    };
  }
  if (!data.data || typeof data.data !== 'object') {
    return { abiertas: [], proximas: [], cerradas: [] };
  }

  const payload = data.data;
  return {
    abiertas: normalizeConvocatorias(payload.abiertas).filter(
      ({ estado }) => estado === 'ABIERTA',
    ),
    proximas: normalizeConvocatorias(payload.proximas).filter(
      ({ estado, visibleEnLanding }) =>
        estado === 'PROGRAMADA' && visibleEnLanding,
    ),
    cerradas: normalizeClosedConvocatorias(payload.cerradas),
  };
};

export const getConvocatoriasGestion = async (): Promise<Convocatoria[]> => {
  const { data } = await axiosClient.get<ApiResponse<Convocatoria[]>>(
    '/convocatorias',
  );
  if (!data.success || !data.data) {
    throw new Error(data.error ?? 'No se pudieron cargar las convocatorias.');
  }
  return data.data;
};

export const crearConvocatoria = async (
  request: CrearConvocatoriaRequest,
): Promise<Convocatoria> => {
  const { data } = await axiosClient.post<ApiResponse<Convocatoria>>(
    '/convocatorias',
    request,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error ?? 'No se pudo crear la convocatoria.');
  }
  return data.data;
};

export const editarConvocatoria = async (
  id: number,
  request: EditarConvocatoriaRequest,
): Promise<Convocatoria> => {
  const { data } = await axiosClient.put<ApiResponse<Convocatoria>>(
    `/convocatorias/${id}`,
    request,
  );
  if (!data.success || !data.data) {
    throw new Error(data.error ?? 'No se pudo actualizar la convocatoria.');
  }
  return data.data;
};

export const finalizarConvocatoria = async (
  id: number,
  password: string,
): Promise<Convocatoria> => {
  const { data } = await axiosClient.patch<ApiResponse<Convocatoria>>(
    `/convocatorias/${id}/finalizar`,
    { password },
  );
  if (!data.success || !data.data) {
    throw new Error(data.error ?? 'No se pudo finalizar la convocatoria.');
  }
  return data.data;
};
