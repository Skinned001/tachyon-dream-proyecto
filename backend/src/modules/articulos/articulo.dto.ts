import type { ArticleState } from './Articulo.model.js';

export type { ArticleState };

export interface CreateArticleDraftRequest {
  title: string;
  abstract: string;
  specialtyId: number;
}

export interface UpdateArticleStateRequest {
  state: ArticleState;
}

export interface ArticleSpecialtyDTO {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface AIReportDTO {
  plagiarismPercentage: number;
  similarityScore: number;
  checklistPassed: boolean;
  observations: string[];
  analyzedAt: string;
}

export interface ArticleVersionDTO {
  id: number;
  articleId: number;
  version_number: number;
  body_text: string | null;
  pdf_path: string | null;
  ai_report: AIReportDTO | null;
  createdAt: string;
}

export interface ArticleDTO {
  id: number;
  title: string;
  summary?: string;
  keywords?: string[];
  coauthors?: string[];
  state: ArticleState;
  responsibleId: number;
  specialtyId: number;
  convocationId: number | null;
  publishedAt?: string | null;
  editionNumber?: string | null;
  doi?: string | null;
  specialty?: ArticleSpecialtyDTO;
  versions?: ArticleVersionDTO[];
  createdAt: string;
}

export interface AuthenticatedArticleUser {
  id: number;
  role: 'AUTOR' | 'DDI' | 'COMITE' | 'PUBLISHER' | 'ADMIN';
}
