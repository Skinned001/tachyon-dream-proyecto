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

export type RoleName = 'AUTOR' | 'DDI' | 'COMITE' | 'PUBLISHER' | 'EDITOR' | 'ADMIN';

export type ConvocationState = 'BORRADOR' | 'PROGRAMADA' | 'ABIERTA' | 'CERRADA';

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
  active: boolean;
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
  convocatoriaId: number;
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
  convocatoriaId: number; // Obligatorio: debe referenciar una convocatoria ABIERTA
}

// POST /api/articulos
// Roles: AUTOR (is_author = true) o ADMIN.
// Multipart/form-data: file (PDF, max 10 MB), title, abstract/summary,
// specialtyId, convocatoriaId (debe estar ABIERTA), coauthors (opcional).
// Crea el artículo en estado PENDIENTE y su versión 1 en article_versions.
// Notifica a todos los usuarios activos con rol DDI.
//
// GET /api/articulos
// Requiere sesión. Filtra según rol:
// - STAFF/AUTOR: solo sus propios manuscritos (dictámenes del comité anónimos: "Revisor 1", "Revisor 2", ...).
// - COMITE: solo manuscritos asignados al revisor.
// - DDI, EDITOR, ADMIN: todos los manuscritos con metadatos completos y comité asignado.
//
// GET /api/articulos/revisores
// Roles: DDI, ADMIN. Lista usuarios activos con rol COMITE.
//
// GET /api/articulos/:id/pdf y GET /api/articulos/:id/versions/:versionId/pdf
// Requiere sesión. Descarga/visualización del PDF solo para autor dueño, DDI,
// revisor COMITE asignado, EDITOR o ADMIN.
//
// PATCH /api/articulos/:id/rechazar-ddi
// Roles: DDI, ADMIN. Solo sobre artículos PENDIENTE.
// Body: { reason: string }. Pasa a RECHAZADO (terminal), guarda rejection_reason y notifica al autor.
//
// PUT /api/articulos/:id/asignar
// Roles: DDI, ADMIN. Solo sobre artículos PENDIENTE.
// Body: { reviewerIds: number[] } (exactamente 1 o 3 miembros activos de COMITE).
// Crea committee_assignments, pasa a EN_REVISION y notifica al autor y a cada revisor asignado.
//
// POST /api/articulos/:id/dictamen
// Roles: COMITE (asignado al artículo), ADMIN (si está asignado). Solo en EN_REVISION.
// Body: { verdict: 'APROBAR' | 'APROBAR_CON_CORRECCIONES' | 'RECHAZAR', comments: string, observations?: string[] }.
// Registra un único voto por (assignmentId, versionId).
// - Ronda v1: espera votos de todos los revisores asignados (1 o 3).
//   * Mayoría RECHAZAR -> RECHAZADO (terminal, notifica al autor).
//   * Mayoría aprobatoria (APROBAR + APROBAR_CON_CORRECCIONES) con al menos un
//     APROBAR_CON_CORRECCIONES -> REVISION_MENOR (notifica al autor).
//   * Mayoría aprobatoria sin pedidos de corrección -> APROBADO (notifica al autor y a EDITOR).
// - Rondas de corrección (v2+): un revisor asignado puede confirmar APROBAR (-> APROBADO,
//   notifica a autor y EDITOR), solicitar nuevas correcciones (-> REVISION_MENOR) o votar RECHAZAR.
//
// POST /api/articulos/:id/versiones
// Roles: AUTOR dueño del manuscrito (o ADMIN). Solo cuando state === 'REVISION_MENOR'.
// Multipart/form-data: file (PDF, max 10 MB), notes/abstract (opcional), title/summary/coauthors (opcional).
// Crea una nueva ArticleVersion (version_number = última + 1), vuelve a EN_REVISION
// manteniendo los mismos revisores asignados (sin volver al DDI) y notifica al COMITE asignado.
//
// POST /api/articulos/:id/aprobar-correccion
// Roles: EDITOR, ADMIN. Solo sobre artículos en EN_REVISION con versión >= 2 (ronda de corrección).
// Pasa directamente a APROBADO y notifica al autor y a los EDITOR.
//
// PATCH /api/articulos/:id/publicar
// Roles: EDITOR, ADMIN. Solo sobre artículos en estado APROBADO o ACEPTADO con PDF disponible.
// Body opcional: { publishedAt?, editionNumber?, doi?, keywords? }.
// Pasa a PUBLICADO, fija publishedAt y notifica al autor (MANUSCRITO_PUBLICADO).
//
// PATCH /api/articulos/:id/retirar
// Roles: EDITOR, ADMIN. Solo sobre artículos en estado PUBLICADO.
// Body obligatorio: { reason: string, password: string } (contraseña actual validada con bcrypt; 401 si es incorrecta).
// Retira inmediatamente del portal público (pasa a APROBADO y limpia publishedAt, conservando historial y versiones)
// y notifica al autor (MANUSCRITO_RETIRADO) con el motivo.

// ----------------------------------------------------------------------------
// 5. MÓDULO EDITORIAL Y CONVOCATORIAS (/api/editorial)
// ----------------------------------------------------------------------------
export interface ConvocationDTO {
  id: number;
  title: string;
  descripcion?: string;
  fechaInicio: string; // ISO 8601 datetime con fecha y hora
  fechaFin: string; // ISO 8601 datetime con fecha y hora
  estado: ConvocationState;
  visibleEnLanding: boolean;
}

export interface CreateConvocationRequest {
  title: string;
  descripcion?: string;
  fechaInicio: string; // ISO 8601 datetime
  fechaFin: string; // ISO 8601 datetime
  estado: 'BORRADOR' | 'PROGRAMADA'; // ABIERTA solo se puede derivar según fechaInicio
  visibleEnLanding?: boolean; // default false
}

export interface UpdateConvocationRequest {
  title?: string;
  descripcion?: string;
  visibleEnLanding?: boolean;
  fechaFin?: string; // ISO 8601 datetime; permite prórrogas
  fechaInicio?: string; // Solo editable si la convocatoria no está ABIERTA
  password: string; // Obligatoria; contraseña actual validada con bcrypt
}

export interface FinalizeConvocationRequest {
  password: string; // Obligatoria; contraseña actual validada con bcrypt
}

export interface PublicConvocationDTO {
  id: number;
  title: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'ABIERTA' | 'PROGRAMADA' | 'CERRADA';
  visibleEnLanding: boolean;
  articulosPublicadosCount: number;
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

// POST /api/convocatorias
// Roles: ADMIN, EDITOR.
// Recibe CreateConvocationRequest.
// El estado puede ser BORRADOR o PROGRAMADA; ABIERTA puede derivarse por fechaInicio.

// PUT /api/convocatorias/:id
// Roles: ADMIN, EDITOR.
// Recibe UpdateConvocationRequest. Permite editar título, descripción,
// visibleEnLanding y fechaFin; fechaInicio solo cuando no está ABIERTA.
// password es obligatoria y se valida con bcrypt.
// Respuesta 401 si password es incorrecta.

// PATCH /api/convocatorias/:id/finalizar
// Roles: ADMIN, EDITOR.
// Recibe FinalizeConvocationRequest.
// Solo opera convocatorias ABIERTAS: establece estado CERRADA y fija fechaFin
// al instante actual. password es obligatoria y se valida con bcrypt.
// Respuesta 401 si password es incorrecta.

// GET /api/convocatorias/publicas
// Endpoint público. Devuelve en PublicConvocationDTO las convocatorias ABIERTAS,
// las próximas PROGRAMADA visibles en landing y las CERRADA de los últimos
// 60 días. Cada elemento incluye articulosPublicadosCount: number.

// ----------------------------------------------------------------------------
// 7. MÓDULO MÉTRICAS (/api/metricas)
// ----------------------------------------------------------------------------
// GET /api/dashboard/summary — requiere sesión autenticada (cookie token).
// Devuelve un resumen calculado desde MySQL adaptado a ADMIN/EDITOR/DDI,
// autores (STAFF con is_author = true) y revisores (COMITE).
//
// Respuesta estándar { success: true, data: DashboardSummaryDTO }:
// - ADMIN/EDITOR: kpis.convocatoriasActivas, convocatoriasProgramadas,
//   enRevision, publicados, recursosBiblioteca, usuariosTotal, autoresCount
//   y revisoresCount; distribucionEstados y los últimos 5 artículos recibidos.
// - DDI: los mismos KPI y recientes de gestión, sin distribución de estados.
// - AUTOR: misManuscritos, enRevision, publicados y convocatoriasAbiertas,
//   con los últimos 5 manuscritos propios.
// - REVISOR: pendientesRevision, evaluados, articulosPublicados y
//   recursosBiblioteca, con los últimos 5 artículos asignados.
// - Todos incluyen convocatoriasAbiertasList, ordenadas por fechaFin ascendente,
//   con id, title y fechaFin ISO.
export interface DashboardSummaryDTO {
  role: 'ADMIN' | 'EDITOR' | 'DDI' | 'AUTOR' | 'REVISOR' | 'GENERAL';
  kpis: Record<string, number>;
  distribucionEstados: { estado: ArticleState; count: number }[];
  recientes: {
    id: number;
    title: string;
    estado: ArticleState;
    createdAt: string;
    autorNombre: string | null;
    convocatoriaTitle: string | null;
  }[];
  convocatoriasAbiertasList: {
    id: number;
    title: string;
    fechaFin: string;
  }[];
}

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
  description?: string | null;
  category: string;
  file_path: string;
  file_size: string;
  fileUrl?: string | null;
  visibility: LibraryVisibility;
  uploadedBy: number | null;
  specialtyId: number | null;
  specialty?: SpecialtyDTO;
  createdAt: string;
}

export interface FavoriteItemDTO {
  id: number;
  targetType: 'ARTICULO' | 'RECURSO';
  targetId: number;
  title: string;
  category: string;
  area: string;
  fileUrl: string | null;
  createdAt: string;
}

// GET /api/biblioteca — público.
// Query opcional: ?convocatoriaId=<id>.
// Sin convocatoriaId devuelve recursos de library_resources (el frontend los
// combina con GET /api/articulos/publicados para mostrar papers y documentos juntos).
// Con convocatoriaId filtra artículos PUBLICADO de esa convocatoria.
//
// GET /api/biblioteca/favoritos — requiere sesión.
// Devuelve FavoriteItemDTO[] persistidos en user_favorites para el usuario autenticado.
//
// POST /api/biblioteca/favoritos/toggle — requiere sesión.
// Body: { targetType: 'ARTICULO' | 'RECURSO', targetId: number }.
// Agrega o quita el favorito y devuelve { saved: boolean, targetType, targetId }.

// ----------------------------------------------------------------------------
// 9.1 DOCUMENTOS INSTITUCIONALES (/api/library-resources)
// ----------------------------------------------------------------------------
export interface InstitutionalLibraryResourceDTO {
  id: number;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string;
  fileName: string | null;
  uploadedBy: number | null;
  uploader?: { id: number; username: string; first_name: string; last_name: string };
  createdAt: string;
  updatedAt: string | null;
}

// GET /api/library-resources — público; solo recursos PUBLICO, ordenados por
// fecha de creación descendente. Filtros opcionales: ?category=MANUAL&search=...
// Respuestas: 200 con InstitutionalLibraryResourceDTO[], 400 si los filtros
// no son válidos.
//
// POST /api/library-resources — JWT; roles ADMIN y EDITOR.
// Content-Type: multipart/form-data; campos obligatorios file (PDF, max. 20 MB),
// title y category; description es opcional.
// Respuestas: 201 creado, 400 por archivo/campos inválidos, 401 sin sesión,
// 403 rol no permitido.
//
// DELETE /api/library-resources/:id — JWT; roles ADMIN y EDITOR.
// Respuestas: 200 eliminado, 400 id inválido, 401 sin sesión, 403 rol no
// permitido, 404 recurso inexistente.
// fileUrl apunta a /uploads/library/<archivo>.pdf; la ruta es pública para
// abrir o descargar el documento.
//
// library_resources conserva title, category, file_path, file_size, visibility
// y specialtyId; agrega description, fileUrl y fileName. uploadedBy es FK
// opcional a users.id; createdAt y updatedAt son timestamps.

// ----------------------------------------------------------------------------
// 9.2 ARCHIVO PÚBLICO DE ARTÍCULOS (/api/articulos/publicados)
// ----------------------------------------------------------------------------
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

// GET /articulos/publicados — sin autenticación; solo estado PUBLICADO.
// GET /articulos/publicados/:id/pdf — sin autenticación; descarga el PDF de la última
// versión con el nombre original del archivo (original_filename) mientras siga PUBLICADO.

// ----------------------------------------------------------------------------
// 10. MÓDULO IA (/api/ai)
// ----------------------------------------------------------------------------
export type SimilarityAnalysisStatus = 'completed' | 'not_evaluable';
export type SimilaritySourceMode = 'demo' | 'uploaded';

export interface SimilarityFindingDTO {
  sourceLabel: string;
  sourcePage: number;
  targetPage: number;
  excerpt: string;
  matchedTokens: number;
}

export interface AIReportDTO {
  analysisId: string;
  status: SimilarityAnalysisStatus;
  sourceMode: SimilaritySourceMode;
  analyzerVersion: string;
  findings: SimilarityFindingDTO[];
  warnings: string[];
  message: string;
  disclaimer: string;
}

// POST /ai/similarity/check — requiere autenticación y permiso de autor
// (is_author = true) o rol DDI, COMITE o ADMIN; multipart con sourceMode,
// targetText o targetFile opcional y referenceFiles[] cuando
// sourceMode = "uploaded".
// El informe se devuelve en la respuesta y no se persiste en el prototipo.

// ----------------------------------------------------------------------------
// 11. MÓDULO NOTIFICACIONES (/api/notificaciones)
// ----------------------------------------------------------------------------
export interface NotificationDTO {
  id: number;
  title: string;
  message: string;
  read: boolean;
  tipo: string;
  referenciaId: number | null;
  createdAt: string;
}

export interface NotificacionesListDTO {
  notificaciones: NotificationDTO[];
  noLeidasCount: number;
}

// GET /api/notificaciones — JWT; últimas 30 del usuario autenticado,
// ordenadas de más reciente a más antigua, y conteo total de no leídas.
// PATCH /api/notificaciones/:id/leer — JWT; solo permite marcar las propias.
// PATCH /api/notificaciones/leer-todas — JWT; marca todas las propias como leídas.
// PATCH /api/notificaciones/preferencias — JWT; recibe
// { recibirNotificaciones: boolean }.
// Las rutas anteriores PUT /read-all y PATCH /:id/read se conservan temporalmente.
//
// Notificacion conserva las columnas actuales userId, title, message y read;
// agrega tipo y referenciaId. Usuario agrega recibirNotificaciones (default true).
// El servicio central filtra autores activos (is_author=true, rol STAFF/AUTOR)
// con recibirNotificaciones=true y evita duplicados de apertura/recordatorio
// por usuario, tipo y convocatoria.

// ----------------------------------------------------------------------------
// 12. MÓDULO AUDITORÍA (/api/auditoria)
// ----------------------------------------------------------------------------
export type AuditEntityType =
  | 'ARTICULO'
  | 'CONVOCATORIA'
  | 'USUARIO'
  | 'RECURSO_BIBLIOTECA';

export interface AuditLogDTO {
  id: number;
  userId: number | null;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  entityType: AuditEntityType;
  entityId: number | null;
  summary: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

// GET /api/auditoria — JWT; solo rol ADMIN.
// Query opcionales: entityType, action, search, from (YYYY-MM-DD), to (YYYY-MM-DD),
// page (default 1), limit (default 25, max 100).
// Devuelve { items: AuditLogDTO[], total, page, limit } ordenado por createdAt DESC.
// Tabla audit_logs alimentada por backend/src/services/auditoria.service.ts.
