import type { ArticleState } from './Articulo.model.js';
import type { RoleName } from '../auth/auth.dto.js';
import type { ReviewVerdict } from '../editorial/Revision.model.js';

export type { ArticleState, ReviewVerdict };

export interface CreateArticleDraftRequest {
  title: string;
  abstract: string;
  specialtyId: number;
  convocatoriaId: number;
  coauthors?: string[];
}

export interface CreateArticleVersionRequest {
  title?: string;
  abstract?: string;
  notes?: string;
  coauthors?: string[];
}

export interface DeskRejectRequest {
  reason: string;
}

export interface AssignReviewersRequest {
  reviewerIds: number[];
}

export interface SubmitVerdictRequest {
  verdict: ReviewVerdict;
  comments: string;
  observations?: string[];
}

export interface PublishArticleRequest {
  publishedAt?: Date;
  editionNumber?: string;
  doi?: string;
  keywords?: string[];
}

export interface WithdrawArticleRequest {
  reason: string;
  password: string;
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

export interface ArticleConvocationDTO {
  id: number;
  title: string;
}

export interface ReviewerCandidateDTO {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialtyId: number | null;
  specialtyName: string | null;
}

export interface AIReportDTO {
  plagiarismPercentage: number;
  similarityScore: number;
  checklistPassed: boolean;
  observations: string[];
  analyzedAt: string;
}

export interface ArticleReviewDTO {
  id: number;
  assignmentId: number;
  versionId: number;
  verdict: ReviewVerdict;
  comments: string;
  observations: string[];
  reviewerLabel: string;
  reviewerName?: string;
  isOwnReview?: boolean;
  createdAt: string;
}

export interface ArticleAssignmentDTO {
  id: number;
  reviewerLabel: string;
  reviewerId?: number;
  reviewerName?: string;
  read_status: boolean;
  hasReviewedLatest: boolean;
}

export interface ArticleVersionDTO {
  id: number;
  articleId: number;
  version_number: number;
  body_text: string | null;
  pdf_path: string | null;
  ai_report: AIReportDTO | null;
  reviews: ArticleReviewDTO[];
  createdAt: string;
}

export interface ArticleDTO {
  id: number;
  title: string;
  summary?: string;
  keywords?: string[];
  coauthors?: string[];
  rejection_reason?: string | null;
  state: ArticleState;
  responsibleId: number;
  authorName?: string;
  specialtyId: number;
  convocationId: number | null;
  convocatoriaId: number | null;
  convocatoria?: ArticleConvocationDTO;
  publishedAt?: string | null;
  editionNumber?: string | null;
  doi?: string | null;
  specialty?: ArticleSpecialtyDTO;
  versions?: ArticleVersionDTO[];
  assignments?: ArticleAssignmentDTO[];
  currentUserAssignment?: {
    id: number;
    read_status: boolean;
    hasReviewedLatest: boolean;
  };
  createdAt: string;
}

export interface PublishedArticleDTO {
  id: number;
  title: string;
  summary?: string;
  keywords?: string[];
  authorName?: string;
  coauthors?: string[];
  publishedAt?: string | null;
  editionNumber?: string | null;
  doi?: string | null;
  specialty?: { id: number; name: string };
  createdAt: string;
  pdfAvailable: boolean;
}

export interface AuthenticatedArticleUser {
  id: number;
  role: RoleName;
  is_author: boolean;
}
