import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';

export type DashboardArticleState =
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

export interface DashboardRecentArticle {
  id: number;
  title: string;
  estado: DashboardArticleState;
  createdAt: string;
  autorNombre: string | null;
  convocatoriaTitle: string | null;
}

export interface DashboardOpenConvocation {
  id: number;
  title: string;
  fechaFin: string;
}

export interface DashboardArticleStateCount {
  estado: DashboardArticleState;
  count: number;
}

export interface ManagementDashboardSummary {
  role: 'ADMIN' | 'EDITOR' | 'DDI';
  kpis: {
    convocatoriasActivas: number;
    convocatoriasProgramadas: number;
    enRevision: number;
    publicados: number;
    recursosBiblioteca: number;
    usuariosTotal: number;
    autoresCount: number;
    revisoresCount: number;
  };
  distribucionEstados: DashboardArticleStateCount[];
  recientes: DashboardRecentArticle[];
  convocatoriasAbiertasList: DashboardOpenConvocation[];
}

export interface AuthorDashboardSummary {
  role: 'AUTOR' | 'GENERAL';
  kpis: {
    misManuscritos: number;
    enRevision: number;
    publicados: number;
    convocatoriasAbiertas: number;
  };
  distribucionEstados: [];
  recientes: DashboardRecentArticle[];
  convocatoriasAbiertasList: DashboardOpenConvocation[];
}

export interface ReviewerDashboardSummary {
  role: 'REVISOR';
  kpis: {
    pendientesRevision: number;
    evaluados: number;
    articulosPublicados: number;
    recursosBiblioteca: number;
  };
  distribucionEstados: [];
  recientes: DashboardRecentArticle[];
  convocatoriasAbiertasList: DashboardOpenConvocation[];
}

export type DashboardSummary =
  | ManagementDashboardSummary
  | AuthorDashboardSummary
  | ReviewerDashboardSummary;

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await axiosClient.get<ApiResponse<DashboardSummary>>(
    '/dashboard/summary',
  );
  if (!data.success || !data.data) {
    throw new Error(data.error ?? 'No se pudo cargar el resumen del Dashboard.');
  }
  return data.data;
};
