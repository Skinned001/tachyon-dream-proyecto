hief-journal/
├── .github/
│   └── copilot-instructions.md       ← Reglas automáticas SDD + TypeScript para Copilot
├── spec.md                           ← Fuente de la verdad del sistema
├── docker-compose.yml                ← Orquesta MySQL/MariaDB + Backend + AI-Service
├── .gitignore
├── README.md
│
├── ai-service/                       ← Microservicio Python (FastAPI) independiente
│   ├── app/
│   │   ├── checklists/
│   │   │   └── requirements.py
│   │   ├── similarity/
│   │   │   └── embeddings.py
│   │   ├── plagiarism/
│   │   │   └── checker.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt              ← Movido adentro de ai-service
│
├── backend/                          ← Node.js + Express + Sequelize + TypeScript
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── jwt.ts
│   │   │   ├── multer.ts             ← Subida de PDFs (Artículos y Biblioteca)
│   │   │   └── admin.ts              ← (≽/ᐠ Ф⩊Ф ᐟ\≼) ⟆ Burunyuu (AdminJS)
│   │   ├── database/
│   │   │   ├── associations.ts       ← Centraliza todos los hasMany / belongsTo
│   │   │   └── seed.ts               ← Roles, Especialidades y usuarios semilla
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts    ← requireRole('ADMIN' | 'COMITE' | 'AUTOR')
│   │   │   └── error.middleware.ts   ← Respuesta estándar { success, error }
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.dto.ts       ← Interfaces TS de Login/Registro
│   │   │   ├── usuarios/
│   │   │   │   ├── usuarios.routes.ts
│   │   │   │   ├── usuarios.controller.ts
│   │   │   │   ├── usuarios.service.ts
│   │   │   │   ├── Usuario.model.ts
│   │   │   │   └── Rol.model.ts      ← Modelo de Roles
│   │   │   ├── especialidades/
│   │   │   │   ├── especialidades.routes.ts
│   │   │   │   ├── especialidades.controller.ts
│   │   │   │   ├── especialidades.service.ts
│   │   │   │   └── Especialidad.model.ts
│   │   │   ├── articulos/            ← Autores: Envío y versiones
│   │   │   │   ├── articulos.routes.ts
│   │   │   │   ├── articulos.controller.ts
│   │   │   │   ├── articulos.service.ts
│   │   │   │   ├── Articulo.model.ts       ← Incluye convocatoriaId (FK a Convocatoria)
│   │   │   │   └── ArticuloVersion.model.ts
│   │   │   ├── editorial/            ← Comité y Admin: Convocatorias y Revisiones
│   │   │   │   ├── editorial.routes.ts
│   │   │   │   ├── editorial.controller.ts
│   │   │   │   ├── editorial.service.ts
│   │   │   │   ├── Convocatoria.model.ts
│   │   │   │   ├── convocatoria-cron.service.ts ← node-cron para estados automáticos
│   │   │   │   ├── AsignacionComite.model.ts
│   │   │   │   └── Revision.model.ts
│   │   │   ├── biblioteca/           ← TU MÓDULO (Biblioteca Virtual)
│   │   │   │   ├── biblioteca.routes.ts
│   │   │   │   ├── biblioteca.controller.ts
│   │   │   │   ├── biblioteca.service.ts
│   │   │   │   ├── library-resources.routes.ts
│   │   │   │   ├── library-resources.controller.ts
│   │   │   │   ├── library-resources.service.ts
│   │   │   │   ├── library-resources.dto.ts
│   │   │   │   └── RecursoBiblioteca.model.ts
│   │   │   ├── ai/                   ← Conecta Express con FastAPI / Ollama
│   │   │   │   ├── providers/
│   │   │   │   │   └── ollama.provider.ts
│   │   │   │   ├── ai.routes.ts
│   │   │   │   ├── ai.controller.ts
│   │   │   │   └── ai.service.ts
│   │   │   ├── notificaciones/
│   │   │   │   ├── notificaciones.routes.ts
│   │   │   │   ├── notificaciones.controller.ts
│   │   │   │   ├── notificaciones.service.ts  ← Lectura, estado y preferencias
│   │   │   │   └── Notificacion.model.ts
│   │   │   ├── publico/              ← Endpoints abiertos sin JWT
│   │   │   ├── metricas/             ← Estadísticas para DashboardHome
│   │   │   ├── dashboard/            ← Resumen agregado por rol
│   │   │   │   ├── dashboard.routes.ts
│   │   │   │   ├── dashboard.controller.ts
│   │   │   │   ├── dashboard.service.ts
│   │   │   │   └── dashboard.dto.ts
│   │   │   └── migracion/
│   │   ├── services/
│   │   │   └── notificaciones.service.ts      ← Creación y difusión centralizada
│   │   ├── types/
│   │   │   └── express.d.ts          ← Extiende Request con req.user
│   │   ├── app.ts
│   │   └── server.ts
│   ├── uploads/
│   │   ├── articles/.gitkeep
│   │   └── library/.gitkeep
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                         ← React + Vite + TypeScript + Tailwind
    ├── public/
    ├── src/
    │   ├── api/                      ← Clientes Axios tipados por módulo
    │   │   ├── axiosClient.ts        ← Interceptor JWT global
    │   │   ├── dashboard.api.ts      ← GET /api/dashboard/summary
    │   │   ├── auth.api.ts
    │   │   ├── articulos.api.ts
    │   │   ├── editorial.api.ts
    │   │   └── biblioteca.api.ts
    │   ├── components/
    │   │   └── ui/                   ← Botones, Badges, Inputs reutilizables
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── features/                 ← Componentes específicos de cada dominio
    │   │   ├── auth/
    │   │   ├── articulos/
    │   │   ├── editorial/
    │   │   │   └── ModalEdicionConvocatoria.tsx ← Edición y re-autenticación
    │   │   ├── biblioteca/           ← UploadLibraryModal.tsx, ResourceCard.tsx
    │   │   └── metricas/
    │   ├── hooks/
    │   ├── layouts/                  ← Mantiene el orden de tu captura anterior
    │   │   ├── DashboardLayout.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── LogoutButton.tsx
    │   ├── pages/                    ← Vistas principales conectadas al Router
    │   │   ├── BibliotecaHome.tsx   [cite: 1]
    │   │   ├── DashboardHome.tsx    [cite: 1]
    │   │   ├── Login.tsx            [cite: 1]
    │   │   ├── MisArticulos.tsx     [cite: 1]
    │   │   ├── Registro.tsx         [cite: 1]
    │   │   └── Revisiones.tsx       [cite: 1]
    │   ├── routes/                  [cite: 1]
    │   │   ├── AppRoutes.tsx        [cite: 1]
    │   │   ├── PrivateRoutes.tsx    [cite: 1]
    │   │   └── PublicRoutes.tsx     [cite: 1]
    │   ├── types/
    │   │   └── models.d.ts           ← Interfaces TS compartidas (User, Article, LibraryResource)
    │   ├── utils/
    │   ├── App.tsx
    │   └── main.tsx
    ├── tsconfig.json
    ├── vite.config.ts
    └── package.json

## Modelos y archivos nuevos de Convocatorias v2 + Biblioteca

### Dashboard

*   `GET /api/dashboard/summary` requiere autenticación y calcula los KPI, estados y actividad reciente consultando los modelos reales. La respuesta se adapta al rol efectivo (`ADMIN`, `EDITOR`, `DDI`, autor identificado con `is_author` o revisor `COMITE`) e incluye las convocatorias ABIERTAS ordenadas por su cierre.
*   El módulo está implementado en `backend/src/modules/dashboard/`; el cliente y la vista están en `frontend/src/api/dashboard.api.ts` y `frontend/src/pages/DashboardHome.tsx`.

### Convocatoria

*   `fechaInicio`: `DATETIME` — inicio exacto de la convocatoria.
*   `fechaFin`: `DATETIME` — fin exacto de la convocatoria.
*   `estado`: `ENUM('BORRADOR','PROGRAMADA','ABIERTA','CERRADA')`.
*   `visibleEnLanding`: `BOOLEAN`, con default `false`.

### Article

*   `convocatoriaId`: FK apuntando a `Convocatoria`; obligatorio al crear un envío de `AUTOR`.

### Recursos institucionales de Biblioteca

*   Los documentos institucionales PDF (manuales, protocolos, guías clínicas y normativas) se gestionan como `library_resources`, separados de artículos y convocatorias.
*   Se conservan las columnas existentes `title`, `category` (`STRING`), `file_path`, `file_size`, `visibility` y `specialtyId`; se agregan `description` (`TEXT`, nullable), `fileUrl` y `fileName` (nullable). `uploadedBy` es FK nullable a `users.id`; `createdAt` y `updatedAt` son timestamps.
*   `ADMIN` y `EDITOR` pueden subir y borrar recursos. La carga usa Multer, valida `application/pdf`, limita archivos a 20 MB y almacena en `backend/uploads/library/`. Express expone `/uploads/library/` públicamente.
*   El módulo implementa `GET`, `POST` y `DELETE` bajo `/api/library-resources`; la lista pública permite filtrar por `category` y por búsqueda de título/descripción.

### Notificaciones y preferencias

*   `Usuario.recibirNotificaciones`: `BOOLEAN NOT NULL`, default `true`.
*   `Notificacion` conserva las columnas existentes `userId`, `title`, `message` y `read`; agrega `tipo` y `referenciaId` opcional. Se mantienen los timestamps existentes.
*   `backend/src/services/notificaciones.service.ts` centraliza la creación y difusión a usuarios activos identificados como autores (`is_author = true`, rol `STAFF`/`AUTOR`) y con notificaciones habilitadas.
*   Aperturas, recordatorios de cierre a 48 horas y cierres anticipados generan notificaciones; apertura y recordatorio se deduplican por usuario, tipo y convocatoria.
*   El módulo `backend/src/modules/notificaciones/` expone lectura, marcado como leído y actualización de preferencias, siempre para el usuario autenticado.

### Archivos planificados

*   Backend — servicio/job de cron con `node-cron` para ejecutar las transiciones automáticas `PROGRAMADA -> ABIERTA` y `ABIERTA -> CERRADA`, planificado dentro del módulo editorial (por ejemplo, `convocatoria-cron.service.ts`).
*   Frontend — `frontend/src/features/editorial/ModalEdicionConvocatoria.tsx`, modal independiente para guardar cambios y finalizar convocatorias con re-autenticación.