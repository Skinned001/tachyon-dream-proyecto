<!-- Url base -->

http://localhost:3000/api (desarrollo)
https://hief-journal.gob.ar/api (producción)

<!-- Respuesta estandar -->

export interface ApiResponse<T = unknown> {
success: boolean;
data?: T;
error?: string;
}

<!-- Autenticacion -->

Se usa cookie HttpOnly llamada token.

Las peticiones del frontend deben usar withCredentials: true.

El backend valida la cookie con un middleware antes de llegar al controlador.

<!-- Login -->

interface LoginRequest {
email: string;
password: string;
}

<!-- Endpoint -->

// ============================================================================
// CONTRATOS GLOBALES DE API - TRY-TACHYON / HIEF JOURNAL PLATFORM
// ============================================================================

export type RoleName = 'AUTOR' | 'DDI' | 'COMITE' | 'PUBLISHER' | 'ADMIN';

export type ArticleState =
  | 'BORRADOR'
  | 'PENDIENTE' // Enviado al DDI
  | 'EN_REVISION'
  | 'REVISION_MENOR'
  | 'REVISION_MAYOR'
  | 'PENDIENTE_DECISION'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'PUBLICADO';

export type ReviewVerdict = 'ACEPTAR' | 'ACEPTAR_CON_CORRECCIONES' | 'RECHAZAR';

export type LibraryVisibility = 'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL';

// Envoltorio estándar obligatorio para todas las respuestas del Backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------------------------------
// 1. MÓDULO AUTH (/api/auth)
// ----------------------------------------------------------------------------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: RoleName;
  specialtyId: number | null;
  must_change_password: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ----------------------------------------------------------------------------
// 2. MÓDULO USUARIOS (/api/usuarios)
// ----------------------------------------------------------------------------
export interface UserDTO extends AuthUser {
  dni: string | null;
  active: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  dni?: string;
  role: RoleName;
  specialtyId?: number | null;
}

// ----------------------------------------------------------------------------
// 3. MÓDULO ESPECIALIDADES (/api/especialidades)
// ----------------------------------------------------------------------------
export interface SpecialtyDTO {
  id: number;
  name: string;
  description?: string;
  code?: string;
  active: boolean;
  articlesCount?: number;
  reviewersCount?: number;
}

// ----------------------------------------------------------------------------
// 4. MÓDULO ARTÍCULOS (/api/articulos)
// ----------------------------------------------------------------------------
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
  specialty?: SpecialtyDTO;
  versions?: ArticleVersionDTO[];
  createdAt: string;
}

export interface CreateArticleDraftRequest {
  title: string;
  summary?: string;
  keywords?: string[];
  coauthors?: string[];
  specialtyId: number;
  convocationId?: number;
}

// ----------------------------------------------------------------------------
// 5. MÓDULO EDITORIAL Y CONVOCATORIAS (/api/editorial)
// ----------------------------------------------------------------------------
export interface ConvocationDTO {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  active: boolean;
}

export interface AssignReviewersRequest {
  reviewerIds: number[]; // Mínimo 1 o 2 miembros del COMITE
  deadline?: string;
}

export interface DeskRejectRequest {
  reason: string; // Motivo obligatorio de rechazo en escritorio
}

export interface SubmitVerdictRequest {
  versionId: number;
  verdict: ReviewVerdict;
  comments: string; // Obligatorio si es ACEPTAR_CON_CORRECCIONES o RECHAZAR
  internal_comments?: string; // Solo visible para DDI/Comité
}

export interface PublishArticleRequest {
  publishedAt?: string;
  editionNumber?: string;
  doi?: string;
  keywords?: string[];
  specialtyId?: number;
}

// ----------------------------------------------------------------------------
// 7. MÓDULO MÉTRICAS (/api/metricas)
// ----------------------------------------------------------------------------
export interface MetricsSummaryDTO {
  totalVisits: number;
  uniqueVisitors: number;
  totalDownloads: number;
  totalPublishedArticles: number;
}

export interface SpecialtyMetricDTO {
  specialtyId: number;
  specialtyName: string;
  visits: number;
  downloads: number;
}

// ----------------------------------------------------------------------------
// 8. MÓDULO MIGRACIÓN HISTÓRICA (/api/migracion)
// ----------------------------------------------------------------------------
export interface HistoricalMigrationResultDTO {
  totalProcessed: number;
  successful: number;
  failed: { fileName: string; reason: string }[];
}

// ----------------------------------------------------------------------------
// 9. MÓDULO BIBLIOTECA VIRTUAL (/api/biblioteca)
// ----------------------------------------------------------------------------
export interface LibraryResourceDTO {
  id: number;
  title: string;
  category: string;
  file_path: string;
  file_size: string;
  visibility: LibraryVisibility;
  uploadedBy: number;
  specialtyId: number;
  specialty?: SpecialtyDTO;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 10. MÓDULO IA (/api/ai)
// ----------------------------------------------------------------------------
export interface AIReportDTO {
  plagiarismPercentage: number;
  similarityScore: number;
  checklistPassed: boolean;
  observations: string[];
  analyzedAt: string;
}

// ----------------------------------------------------------------------------
// 11. MÓDULO NOTIFICACIONES (/api/notificaciones)
// ----------------------------------------------------------------------------
export interface NotificationDTO {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
