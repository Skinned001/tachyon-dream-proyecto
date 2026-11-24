# Estructura del Proyecto (`develop-laprida`)

```text
hief-journal/
├── .github/ (o github/)
│   └── copilot-instructions.md          ← Reglas SDD + TypeScript estricto
├── spec.md                              ← Especificación funcional y reglas de negocio
├── Contrato.md                          ← Contratos de endpoints, roles y DTOs (fuente de verdad API)
├── Estructura.md                        ← Mapa de módulos, tablas y flujos implementados
├── docker-compose.yml                   ← Orquesta MySQL/MariaDB + Backend + AI-Service
├── .gitignore
├── README.md
│
├── ai-service/                          ← Microservicio Python (FastAPI) independiente (en desarrollo)
│   ├── app/
│   │   ├── checklists/requirements.py
│   │   ├── similarity/embeddings.py
│   │   ├── plagiarism/checker.py
│   │   └── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── spec.md
│
├── backend/                             ← Node.js + Express + Sequelize + TypeScript (strict)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts              ← Sequelize (MariaDB/MySQL o PostgreSQL por env)
│   │   │   ├── email.ts                 ← Envío SMTP (aprobación de solicitudes)
│   │   │   ├── jwt.ts                   ← signToken / verifyToken (HS256, 8h)
│   │   │   ├── multer.ts                ← Subida PDFs (articles, library), avatares y credenciales
│   │   │   ├── uploads.ts               ← Directorio base absoluto `uploadsDirectory`
│   │   │   └── admin.ts
│   │   ├── database/
│   │   │   ├── associations.ts          ← Centraliza inicialización y relaciones Sequelize
│   │   │   ├── roles.ts                 ← Sincronización de los 5 roles (STAFF, DDI, COMITE, EDITOR, ADMIN)
│   │   │   └── seed.ts                  ← Roles, 4 especialidades y 5 usuarios de prueba
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts       ← authenticateJWT / optionalAuthenticateJWT (cookie HttpOnly o Bearer)
│   │   │   ├── role.middleware.ts       ← requireRole(roles) y requireAuthor (is_author || ADMIN)
│   │   │   └── error.middleware.ts      ← Respuesta estándar { success: false, error }
│   │   ├── modules/
│   │   │   ├── auth/                    ← Login, registro con credencial, perfil, cambio de clave
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.dto.ts
│   │   │   ├── usuarios/                ← CRUD de usuarios (ADMIN) + aprobación/rechazo de solicitudes
│   │   │   │   ├── usuarios.routes.ts
│   │   │   │   ├── usuarios.controller.ts
│   │   │   │   ├── usuarios.service.ts
│   │   │   │   ├── Usuario.model.ts
│   │   │   │   └── Rol.model.ts
│   │   │   ├── especialidades/          ← GET /api/especialidades (especialidades médicas activas)
│   │   │   │   ├── especialidades.routes.ts
│   │   │   │   ├── especialidades.controller.ts
│   │   │   │   ├── especialidades.service.ts
│   │   │   │   └── Especialidad.model.ts
│   │   │   ├── articulos/               ← Ciclo de vida completo de manuscritos y versionado
│   │   │   │   ├── articulo.routes.ts
│   │   │   │   ├── articulo.controller.ts
│   │   │   │   ├── articulo.service.ts
│   │   │   │   ├── articulo.dto.ts
│   │   │   │   ├── Articulo.model.ts        ← Incluye convocatoriaId, coauthors, rejection_reason, publishedAt, editionNumber, doi
│   │   │   │   └── ArticuloVersion.model.ts ← Versionado inmutable (v1, v2...), pdf_path, original_filename, ai_report
│   │   │   ├── editorial/               ← Convocatorias v2 + modelos de comité y revisiones
│   │   │   │   ├── editorial.routes.ts
│   │   │   │   ├── editorial.controller.ts
│   │   │   │   ├── editorial.service.ts
│   │   │   │   ├── Convocatoria.model.ts
│   │   │   │   ├── convocatoria-cron.service.ts ← node-cron para transiciones y recordatorios
│   │   │   │   ├── AsignacionComite.model.ts    ← committee_assignments (reviewerId, articleId)
│   │   │   │   └── Revision.model.ts            ← reviews (verdict, comments, observations, assignmentId, versionId)
│   │   │   ├── biblioteca/              ← Biblioteca Virtual, Documentos Institucionales y Favoritos
│   │   │   │   ├── biblioteca.routes.ts         ← /api/biblioteca + /favoritos + /favoritos/toggle
│   │   │   │   ├── biblioteca.controller.ts
│   │   │   │   ├── biblioteca.service.ts
│   │   │   │   ├── biblioteca.dto.ts
│   │   │   │   ├── Favorito.model.ts            ← Tabla user_favorites (ARTICULO | RECURSO)
│   │   │   │   ├── library-resources.routes.ts  ← /api/library-resources (manuales/protocolos)
│   │   │   │   ├── library-resources.controller.ts
│   │   │   │   ├── library-resources.service.ts
│   │   │   │   ├── library-resources.dto.ts
│   │   │   │   └── RecursoBiblioteca.model.ts
│   │   │   ├── notificaciones/          ← Lectura, marcado de leídas y preferencias del usuario
│   │   │   │   ├── notificaciones.routes.ts
│   │   │   │   ├── notificaciones.controller.ts
│   │   │   │   ├── notificaciones.service.ts
│   │   │   │   └── Notificacion.model.ts
│   │   │   ├── dashboard/               ← GET /api/dashboard/summary adaptado por rol
│   │   │   │   ├── dashboard.routes.ts
│   │   │   │   ├── dashboard.controller.ts
│   │   │   │   ├── dashboard.service.ts
│   │   │   │   └── dashboard.dto.ts
│   │   │   ├── auditoria/               ← GET /api/auditoria (solo ADMIN, trazabilidad inmutable)
│   │   │   │   ├── auditoria.routes.ts
│   │   │   │   ├── auditoria.controller.ts
│   │   │   │   ├── auditoria.service.ts
│   │   │   │   └── AuditLog.model.ts        ← Tabla audit_logs
│   │   │   ├── ai/                      ← Stub preparado para integración con ai-service
│   │   │   ├── metricas/                ← Pendiente (etapa posterior)
│   │   │   ├── migracion/               ← Pendiente (etapa posterior)
│   │   │   └── publico/
│   │   ├── services/
│   │   │   ├── auditoria.service.ts     ← Helper registrarAuditoria(...) usado por todos los módulos
│   │   │   └── notificaciones.service.ts ← Difusión por rol, por IDs y a autores activos
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── uploads/
│   │   ├── articles/.gitkeep
│   │   └── library/.gitkeep
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                            ← React 18 + Vite + TypeScript + Tailwind CSS
    ├── src/
    │   ├── api/                         ← Clientes Axios tipados
    │   │   ├── axiosClient.ts           ← withCredentials: true + normalización de errores
    │   │   ├── auth.api.ts
    │   │   ├── articulos.api.ts         ← Ciclo editorial completo, PDFs, publicar y retirar
    │   │   ├── auditoria.api.ts         ← GET /api/auditoria con filtros y paginación
    │   │   ├── biblioteca.api.ts        ← Recursos + artículos publicados + favoritos
    │   │   ├── convocatorias.api.ts
    │   │   ├── dashboard.api.ts
    │   │   ├── especialidades.api.ts    ← GET /api/especialidades
    │   │   ├── library-resources.api.ts
    │   │   ├── notificaciones.api.ts
    │   │   ├── usuarios.api.ts
    │   │   ├── comite.api.ts            ← Reexporta articulos.api.ts
    │   │   └── editor.api.ts            ← Reexporta articulos.api.ts
    │   ├── components/ui/               ← Button, Card, Input, InputPassword, Modal
    │   ├── context/AuthContext.tsx
    │   ├── features/
    │   │   ├── articulos/
    │   │   │   └── ArticleWorkflowMeta.tsx      ← Badges, bloque preliminar de IA e historial de versiones
    │   │   ├── editorial/
    │   │   │   └── ModalEdicionConvocatoria.tsx ← Edición y finalización con contraseña
    │   │   └── notificaciones/
    │   │       └── NotificacionesBell.tsx       ← Campana en header + preferencia de convocatorias
    │   ├── layouts/
    │   │   ├── DashboardLayout.tsx
    │   │   └── Sidebar.tsx              ← Menú filtrado dinámicamente por rol / is_author
    │   ├── pages/
    │   │   ├── PortalHome.tsx           ← Landing pública (/): convocatorias y archivo publicado
    │   │   ├── BibliotecaHome.tsx       ← /biblioteca: papers publicados + manuales + Mis guardados
    │   │   ├── DashboardHome.tsx        ← /dashboard: KPIs por rol + recientes + Mis guardados
    │   │   ├── MisArticulos.tsx         ← /articulos y /mis-articulos: envíos, dictámenes anónimos y v2+
    │   │   ├── MesaEntradaDDI.tsx       ← /mesa-entrada: evaluación inicial DDI, rechazo o derivación (1 o 3 jueces)
    │   │   ├── Revisiones.tsx           ← /revisiones: bandeja del Comité Científico y emisión de dictamen
    │   │   ├── PanelEditor.tsx          ← /editor: publicar, retirar (con contraseña) y validar correcciones
    │   │   ├── PanelConvocatorias.tsx   ← /convocatorias: gestión Convocatorias v2
    │   │   ├── RecursosBibliotecaAdmin.tsx ← /recursos-biblioteca: carga/eliminación de manuales PDF
    │   │   ├── AdminUsuarios.tsx        ← /admin/usuarios: CRUD usuarios + pestaña solicitudes
    │   │   ├── AdminAuditoria.tsx       ← /admin/auditoria: visor de auditoría con filtros y paginación
    │   │   ├── PanelUsuarios.tsx        ← Componente de aprobación/rechazo de solicitudes
    │   │   ├── Notificaciones.tsx       ← /notificaciones: listado y redirección por tipo
    │   │   ├── Perfil.tsx               ← /perfil: datos, avatar y cambio de contraseña
    │   │   ├── Login.tsx
    │   │   └── Registro.tsx
    │   ├── routes/
    │   │   ├── AppRoutes.tsx
    │   │   ├── BibliotecaRoute.tsx
    │   │   ├── PrivateRoutes.tsx
    │   │   ├── PublicRoutes.tsx
    │   │   └── RoleRoute.tsx            ← Soporta allowedRoles y requireAuthor
    │   ├── types/
    │   │   ├── api.types.ts
    │   │   └── user.types.ts
    │   └── utils/
    │       ├── formatDate.ts
    │       └── profileImage.ts
    ├── tsconfig.json
    ├── vite.config.ts
    └── package.json
```

---

## Módulos y flujos implementados en `develop-laprida`

### 1. Flujo editorial completo de manuscritos (`/api/articulos`)

Ciclo de estados implementado:

```text
AUTOR sube v1 ──► PENDIENTE (DDI)
                     ├──► DDI rechaza en escritorio ──► RECHAZADO (terminal, sin edición)
                     └──► DDI asigna 1 o 3 COMITE ──► EN_REVISION
                                                         ├──► Mayoría RECHAZAR ──► RECHAZADO (terminal)
                                                         ├──► Mayoría aprobatoria con correcciones ──► REVISION_MENOR
                                                         │        └──► AUTOR sube v2+ ──► EN_REVISION (mismo COMITE)
                                                         │                 └──► COMITE o EDITOR aprueba ──► APROBADO
                                                         └──► Mayoría APROBAR sin cambios ──► APROBADO
                                                                                                 ├──► EDITOR publica ──► PUBLICADO
                                                                                                 └──► EDITOR/ADMIN retira (motivo + clave) ──► APROBADO
```

- **Versionado inmutable (`article_versions`):** cada corrección del autor crea una nueva fila (`version_number = última + 1`) conservando el PDF anterior y el nombre original del archivo (`original_filename`), que se respeta en descargas públicas y privadas.
- **Votación del Comité:** el `DDI` asigna estrictamente **1 o 3 revisores** (`COMITE` activos). En `v1` se espera el voto de todos los asignados; `APROBAR` y `APROBAR_CON_CORRECCIONES` suman juntos como aprobatorios frente a `RECHAZAR`, pero cualquier pedido de correcciones pasa primero a `REVISION_MENOR` para atenderse antes de publicar.
- **Anonimato:** al `AUTOR` (`STAFF`) los dictámenes se le devuelven únicamente con `reviewerLabel` (`"Revisor 1"`, `"Revisor 2"`, `"Revisor 3"`), sin exponer identidad. Para `DDI`, `EDITOR` y `ADMIN` sí se muestra el comité evaluador completo.
- **Integración preparada para IA (`ai-service`):** `article_versions.ai_report` (`JSON`) ya está soportado en backend y renderizado condicionalmente en `MesaEntradaDDI` y `Revisiones` mediante `ArticleWorkflowMeta.tsx`.
- **Notificaciones automáticas:**
  - `MANUSCRITO_RECIBIDO` → `DDI`
  - `MANUSCRITO_RECHAZADO_DDI` → `AUTOR`
  - `MANUSCRITO_EN_REVISION` → `AUTOR`
  - `MANUSCRITO_ASIGNADO` → `COMITE` asignado
  - `MANUSCRITO_RESUELTO` → `AUTOR`
  - `MANUSCRITO_CORREGIDO` → `COMITE` asignado
  - `MANUSCRITO_APROBADO_PUBLICACION` → `EDITOR`
  - `MANUSCRITO_PUBLICADO` y `MANUSCRITO_RETIRADO` → `AUTOR`

### 2. Matriz de rutas y menú por perfil (Frontend)

- **Públicas:** `/` (`PortalHome`), `/biblioteca` (`BibliotecaHome`), `/login`, `/registro`.
- **Todos los autenticados:** `/dashboard`, `/biblioteca`, `/notificaciones`, `/perfil`.
- **Autor (`is_author = true` o `ADMIN`):** `/articulos` y `/mis-articulos` (`MisArticulos`).
- **`DDI` o `ADMIN`:** `/mesa-entrada` (`MesaEntradaDDI`).
- **`COMITE` o `ADMIN`:** `/revisiones` (`Revisiones`).
- **`EDITOR` o `ADMIN`:** `/editor` (`PanelEditor`), `/convocatorias` (`PanelConvocatorias`), `/recursos-biblioteca` (`RecursosBibliotecaAdmin`).
- **`ADMIN` exclusivo:** `/admin/usuarios` (`AdminUsuarios` + pestaña de solicitudes), `/admin/auditoria` (`AdminAuditoria`).
- **Organización del menú lateral (`Sidebar.tsx`):** agrupado en secciones visuales (**General**, **Flujo Editorial**, **Gestión**, **Administración**) mostrando solo los bloques visibles para el rol; el acceso a `/notificaciones` se ofrece directo desde la campana en el encabezado (`NotificacionesBell.tsx`).

### 3. Convocatorias v2, Biblioteca unificada y Favoritos

- **Convocatorias v2 (`/api/convocatorias`):** estados `BORRADOR`, `PROGRAMADA`, `ABIERTA`, `CERRADA`, `fechaInicio`/`fechaFin` `DATETIME`, `visibleEnLanding`, cron automático (`convocatoria-cron.service.ts`) y re-autenticación por contraseña al editar o finalizar.
- **Especialidades (`/api/especialidades`):** lista especialidades médicas activas desde `specialties`.
- **Biblioteca Virtual (`/api/biblioteca` y `/api/library-resources`):** `/biblioteca` muestra en un mismo catálogo los **Artículos publicados** (`GET /api/articulos/publicados`) y los **Documentos institucionales** (`MANUAL`, `PROTOCOLO`, `GUIA`, `NORMATIVA`, `OTRO`), con filtro por categoría y por `?convocatoriaId=`.
- **Favoritos persistentes (`user_favorites`):** `GET /api/biblioteca/favoritos` y `POST /api/biblioteca/favoritos/toggle` para usuarios autenticados (y respaldo en `localStorage` para invitados), accesibles desde el filtro **"Mis guardados"** en `/biblioteca`, el bloque rápido **"Mis guardados"** en `/dashboard` y el marcador en `/`.

### 4. Dashboard, Notificaciones y Auditoría

- **Dashboard (`/api/dashboard/summary`):** KPIs, distribución de estados y actividad reciente calculados en vivo desde BD y adaptados a `ADMIN`, `EDITOR`, `DDI`, `AUTOR` y `REVISOR` (`COMITE`).
- **Notificaciones (`/api/notificaciones`):** campana en tiempo real (`NotificacionesBell.tsx`), página completa con redirección automática por `tipo` (`Notificaciones.tsx`) y preferencia `Usuario.recibirNotificaciones`.
- **Auditoría (`/api/auditoria`, tabla `audit_logs`):** registro centralizado mediante `backend/src/services/auditoria.service.ts` (`registrarAuditoria`) para acciones críticas sobre manuscritos (`MANUSCRITO_ENVIADO`, `MANUSCRITO_VERSION_SUBIDA`, `MANUSCRITO_RECHAZADO_DDI`, `MANUSCRITO_ASIGNADO`, `MANUSCRITO_DICTAMEN`, `MANUSCRITO_CORRECCION_APROBADA`, `MANUSCRITO_PUBLICADO`, `MANUSCRITO_RETIRADO`), convocatorias (`CONVOCATORIA_CREADA`, `CONVOCATORIA_EDITADA`, `CONVOCATORIA_FINALIZADA`), usuarios (`USUARIO_CREADO`, `USUARIO_EDITADO`, `USUARIO_SUSPENDIDO`, `USUARIO_APROBADO`, `USUARIO_RECHAZADO`, `USUARIO_PASSWORD_RESET`) y biblioteca (`RECURSO_BIBLIOTECA_CREADO`, `RECURSO_BIBLIOTECA_ELIMINADO`). Visor solo lectura para `ADMIN` en `/admin/auditoria`.
