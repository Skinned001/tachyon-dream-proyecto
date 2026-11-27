# Estructura del Proyecto (`develop-laprida`)

```text
hief-journal/
├── .github/
│   └── copilot-instructions.md          ← Reglas SDD + TypeScript estricto
├── spec.md                              ← Especificación funcional y reglas de negocio
├── Contrato.md                          ← Contratos de endpoints, roles y DTOs (fuente de verdad API)
├── Estructura.md                        ← Mapa de módulos, tablas y flujos implementados
├── docker-compose.yml                   ← Orquesta MySQL 8.0 + Backend + Frontend (Nginx)
├── .env.example                         ← Variables de entorno base (BD, JWT, correo, puertos)
├── .gitignore
├── README.md
│
├── ai-service/                          ← Microservicio Python (FastAPI) independiente (en diseño SDD)
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
│   │   │   ├── database.ts              ← Sequelize (MySQL/MariaDB o PostgreSQL por env)
│   │   │   ├── email.ts                 ← Reexporta utilidades de `utils/mailer.ts`
│   │   │   ├── jwt.ts                   ← signToken / verifyToken (HS256, 8h)
│   │   │   ├── multer.ts                ← Subida PDFs (articles, library), avatares y credenciales
│   │   │   ├── uploads.ts               ← Directorio base absoluto `uploadsDirectory`
│   │   │   └── admin.ts
│   │   ├── database/
│   │   │   ├── associations.ts          ← Centraliza inicialización y relaciones Sequelize
│   │   │   ├── cleanupIndexes.ts        ← Limpieza segura de índices duplicados en `users.dni`
│   │   │   ├── roles.ts                 ← Sincronización de los 5 roles (STAFF, DDI, COMITE, EDITOR, ADMIN)
│   │   │   └── seed.ts                  ← Roles, especialidades iniciales y usuarios de prueba
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts       ← authenticateJWT / optionalAuthenticateJWT (cookie HttpOnly o Bearer)
│   │   │   ├── role.middleware.ts       ← requireRole(roles) y requireAuthor (is_author || ADMIN)
│   │   │   └── error.middleware.ts      ← Respuesta estándar { success: false, error }
│   │   ├── modules/
│   │   │   ├── auth/                    ← Login, registro con credencial, perfil, cambio de clave
│   │   │   ├── usuarios/                ← CRUD de usuarios (ADMIN) + aprobación/rechazo de solicitudes
│   │   │   ├── especialidades/          ← GET público + POST/PUT (ADMIN, con validación 409 de duplicados)
│   │   │   ├── articulos/               ← Ciclo de vida completo de manuscritos, PDFs y versionado inmutable
│   │   │   ├── editorial/               ← Convocatorias v2 + node-cron + modelos de comité y revisiones
│   │   │   ├── biblioteca/              ← Biblioteca Virtual, Documentos Institucionales y Favoritos (`user_favorites`)
│   │   │   ├── portal/                  ← Revista Oficial HIEF (`revista_ediciones`) y Novedades (`portal_novedades`)
│   │   │   ├── notificaciones/          ← Lectura, marcado de leídas y preferencias del usuario
│   │   │   ├── dashboard/               ← GET /api/dashboard/summary adaptado por rol
│   │   │   ├── auditoria/               ← GET /api/auditoria (solo ADMIN, tabla `audit_logs`)
│   │   │   ├── metricas/                ← POST /api/metricas/track y GET /api/metricas/overview (`metric_events`)
│   │   │   ├── ai/                      ← Stub preparado para futura integración con `ai-service`
│   │   │   └── migracion/               ← Pendiente (carga masiva histórica)
│   │   ├── services/
│   │   │   ├── auditoria.service.ts     ← Helper central `registrarAuditoria(...)`
│   │   │   └── notificaciones.service.ts ← Difusión por rol, por IDs y a autores activos
│   │   ├── utils/
│   │   │   └── mailer.ts                ← Servicio SMTP unificado (aprobación, habilitación y baja)
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── uploads/
│   │   ├── articles/.gitkeep
│   │   └── library/.gitkeep
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                            ← React 18 + Vite + TypeScript + Tailwind CSS (cero inline styles)
    ├── public/
    │   └── images/                      ← Identidad visual HIEF + Instituto Politécnico Formosa
    ├── src/
    │   ├── api/                         ← Clientes Axios tipados
    │   │   ├── axiosClient.ts           ← withCredentials: true + normalización de errores
    │   │   ├── auth.api.ts
    │   │   ├── articulos.api.ts         ← Ciclo editorial completo, PDFs, publicar y retirar
    │   │   ├── auditoria.api.ts         ← GET /api/auditoria con filtros y paginación
    │   │   ├── biblioteca.api.ts        ← Recursos + artículos publicados + favoritos + vista/descarga
    │   │   ├── convocatorias.api.ts
    │   │   ├── dashboard.api.ts
    │   │   ├── especialidades.api.ts    ← GET/POST/PUT /api/especialidades
    │   │   ├── library-resources.api.ts
    │   │   ├── metricas.api.ts          ← Tracking de visitas/descargas + overview analítico
    │   │   ├── notificaciones.api.ts
    │   │   ├── portal.api.ts            ← Contenido público y administración de Revista Oficial / Novedades
    │   │   ├── usuarios.api.ts
    │   │   ├── comite.api.ts            ← Reexporta articulos.api.ts
    │   │   ├── editor.api.ts            ← Reexporta articulos.api.ts
    │   │   └── editorial.api.ts         ← Reexporta convocatorias.api.ts
    │   ├── components/ui/               ← Button, Card, ConfirmPasswordInput, DatePicker, Input, InputPassword, Modal
    │   ├── context/AuthContext.tsx
    │   ├── features/
    │   │   ├── articulos/ArticleWorkflowMeta.tsx
    │   │   ├── editorial/ModalEdicionConvocatoria.tsx
    │   │   └── notificaciones/NotificacionesBell.tsx
    │   ├── layouts/
    │   │   ├── DashboardLayout.tsx
    │   │   ├── Navbar.tsx
    │   │   └── Sidebar.tsx              ← Menú filtrado dinámicamente por rol / is_author
    │   ├── pages/
    │   │   ├── PortalHome.tsx           ← Landing pública (/): Revista Oficial, Novedades, Convocatorias y Archivo
    │   │   ├── BibliotecaHome.tsx       ← /biblioteca: papers publicados + manuales + Mis guardados
    │   │   ├── DashboardHome.tsx        ← /dashboard: KPIs por rol + distribución SVG + Mis guardados
    │   │   ├── MisArticulos.tsx         ← /articulos y /mis-articulos: envíos, dictámenes anónimos y v2+
    │   │   ├── MesaEntradaDDI.tsx       ← /mesa-entrada: evaluación inicial DDI, rechazo o derivación (1 o 3 jueces)
    │   │   ├── Revisiones.tsx           ← /revisiones: bandeja del Comité Científico y emisión de dictamen
    │   │   ├── PanelEditor.tsx          ← /editor: publicar, retirar (con contraseña) y validar correcciones
    │   │   ├── PanelConvocatorias.tsx   ← /convocatorias: gestión Convocatorias v2
    │   │   ├── RecursosBibliotecaAdmin.tsx ← /recursos-biblioteca: carga/eliminación de manuales PDF
    │   │   ├── GestionPortal.tsx        ← /gestion-portal: administración de Revista Oficial HIEF y Novedades
    │   │   ├── AdminUsuarios.tsx        ← /admin/usuarios: CRUD usuarios + pestaña solicitudes
    │   │   ├── AdminEspecialidades.tsx  ← /admin/especialidades: catálogo de especialidades médicas
    │   │   ├── AdminAuditoria.tsx       ← /admin/auditoria: visor de auditoría con filtros y paginación
    │   │   ├── AdminMetricas.tsx        ← /admin/metricas: analítica de visitas, descargas y tiempos editoriales
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
    │   └── utils/
    ├── Dockerfile
    ├── nginx.conf                       ← Proxy inverso a `/api/`, `/uploads/` y `/health`
    ├── tsconfig.json
    ├── vite.config.ts
    └── package.json
```

---

## Módulos y flujos implementados en `develop-laprida`

### 1. Flujo editorial completo de manuscritos (`/api/articulos`)

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

- **Versionado inmutable (`article_versions`):** cada corrección crea una nueva fila (`version_number = última + 1`) conservando el PDF anterior y el nombre original del archivo (`original_filename`), que se respeta en las descargas públicas y privadas; además, `?inline=1` permite abrir el PDF directamente en el navegador.
- **Votación del Comité y anonimato:** el `DDI` asigna estrictamente **1 o 3 revisores** (`COMITE` activos). Al `AUTOR` (`STAFF`) los dictámenes se le devuelven únicamente con `reviewerLabel` (`"Revisor 1"`, `"Revisor 2"`, `"Revisor 3"`).
- **Preparación para IA (`ai-service`):** `article_versions.ai_report` (`JSON`) ya está soportado en backend y renderizado condicionalmente en `MesaEntradaDDI` y `Revisiones` mediante `ArticleWorkflowMeta.tsx`.

### 2. Matriz de rutas y menú por perfil (Frontend)

- **Públicas:** `/` (`PortalHome`), `/biblioteca` (`BibliotecaHome`), `/login`, `/registro`.
- **Todos los autenticados:** `/dashboard`, `/biblioteca`, `/notificaciones`, `/perfil`.
- **Autor (`is_author = true` o `ADMIN`):** `/articulos` y `/mis-articulos` (`MisArticulos`).
- **`DDI` o `ADMIN`:** `/mesa-entrada` (`MesaEntradaDDI`).
- **`COMITE` o `ADMIN`:** `/revisiones` (`Revisiones`).
- **`EDITOR` o `ADMIN`:** `/editor` (`PanelEditor`), `/convocatorias` (`PanelConvocatorias`), `/recursos-biblioteca` (`RecursosBibliotecaAdmin`), `/gestion-portal` (`GestionPortal`), `/admin/metricas` (`AdminMetricas`).
- **`ADMIN` exclusivo:** `/admin/usuarios` (`AdminUsuarios` + solicitudes), `/admin/especialidades` (`AdminEspecialidades`), `/admin/auditoria` (`AdminAuditoria`).
- **Organización del menú lateral (`Sidebar.tsx`):** agrupado en secciones (**General**, **Flujo Editorial**, **Gestión**, **Administración**) mostrando únicamente las secciones con enlaces habilitados para el usuario activo.

### 3. Portal Público, Revista Oficial HIEF, Convocatorias v2 y Biblioteca

- **Portal y Revista Oficial (`/api/portal`):** gestiona ediciones completas en PDF de la Revista Oficial HIEF (`revista_ediciones`, con portada opcional y edición protagonista destacada) y publicaciones de portada (`portal_novedades`: novedades, jornadas, comunicados y destacados con imagen/PDF/enlace externo).
- **Convocatorias v2 (`/api/convocatorias`):** estados `BORRADOR`, `PROGRAMADA`, `ABIERTA`, `CERRADA`, `fechaInicio`/`fechaFin` `DATETIME`, `visibleEnLanding`, cron automático (`convocatoria-cron.service.ts`) y re-autenticación por contraseña al editar o finalizar.
- **Biblioteca Virtual y Favoritos (`/api/biblioteca` y `/api/library-resources`):** unifica artículos publicados y documentos institucionales (`MANUAL`, `PROTOCOLO`, `GUIA`, `NORMATIVA`, `OTRO`), con guardados persistentes en `user_favorites` y acceso directo desde `/biblioteca` y `/dashboard`.

### 4. Especialidades, Dashboard, Notificaciones, Métricas y Auditoría

- **Especialidades (`/api/especialidades`):** listado público de especialidades activas y CRUD administrativo con baja lógica y validación `409` ante nombres duplicados.
- **Dashboard y Métricas (`/api/dashboard/summary` y `/api/metricas`):** KPIs en tiempo real por rol en `/dashboard`, tracking deduplicado de visitas/descargas (`metric_events`) y panel analítico en `/admin/metricas` con actividad por especialidad, top 5 descargados y tiempos promedio editoriales.
- **Auditoría (`/api/auditoria`, tabla `audit_logs`):** trazabilidad inmutable mediante `registrarAuditoria` sobre `ARTICULO`, `CONVOCATORIA`, `USUARIO`, `RECURSO_BIBLIOTECA`, `ESPECIALIDAD`, `REVISTA` y `PORTAL_NOVEDAD`, consultable por `ADMIN` en `/admin/auditoria`.
