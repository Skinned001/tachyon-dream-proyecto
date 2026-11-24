import type { ArticleState } from '../articulos/Articulo.model.js';

export type DashboardRole =
  | 'ADMIN'
  | 'EDITOR'
  | 'DDI'
  | 'AUTOR'
  | 'REVISOR'
  | 'GENERAL';

export interface DashboardRecentArticleDTO {
  id: number;
  title: string;
  estado: ArticleState;
  createdAt: string;
  autorNombre: string | null;
  convocatoriaTitle: string | null;
}

export interface DashboardOpenConvocationDTO {
  id: number;
  title: string;
  fechaFin: string;
}

export interface DashboardArticleStateCountDTO {
  estado: ArticleState;
  count: number;
}

interface DashboardCommonDTO {
  recientes: DashboardRecentArticleDTO[];
  convocatoriasAbiertasList: DashboardOpenConvocationDTO[];
}

export interface ManagementDashboardKpis {
  convocatoriasActivas: number;
  convocatoriasProgramadas: number;
  enRevision: number;
  publicados: number;
  recursosBiblioteca: number;
  usuariosTotal: number;
  autoresCount: number;
  revisoresCount: number;
}

export interface AuthorDashboardKpis {
  misManuscritos: number;
  enRevision: number;
  publicados: number;
  convocatoriasAbiertas: number;
}

export interface ReviewerDashboardKpis {
  pendientesRevision: number;
  evaluados: number;
  articulosPublicados: number;
  recursosBiblioteca: number;
}

export type DashboardSummaryDTO =
  | (DashboardCommonDTO & {
      role: 'ADMIN' | 'EDITOR';
      kpis: ManagementDashboardKpis;
      distribucionEstados: DashboardArticleStateCountDTO[];
    })
  | (DashboardCommonDTO & {
      role: 'DDI';
      kpis: ManagementDashboardKpis;
      distribucionEstados: [];
    })
  | (DashboardCommonDTO & {
      role: 'AUTOR' | 'GENERAL';
      kpis: AuthorDashboardKpis;
      distribucionEstados: [];
    })
  | (DashboardCommonDTO & {
      role: 'REVISOR';
      kpis: ReviewerDashboardKpis;
      distribucionEstados: [];
    });
