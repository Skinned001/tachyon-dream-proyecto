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
│   │   │   │   ├── Articulo.model.ts
│   │   │   │   └── ArticuloVersion.model.ts
│   │   │   ├── editorial/            ← Comité y Admin: Convocatorias y Revisiones
│   │   │   │   ├── editorial.routes.ts
│   │   │   │   ├── editorial.controller.ts
│   │   │   │   ├── editorial.service.ts
│   │   │   │   ├── Convocatoria.model.ts
│   │   │   │   ├── AsignacionComite.model.ts
│   │   │   │   └── Revision.model.ts
│   │   │   ├── biblioteca/           ← TU MÓDULO (Biblioteca Virtual)
│   │   │   │   ├── biblioteca.routes.ts
│   │   │   │   ├── biblioteca.controller.ts
│   │   │   │   ├── biblioteca.service.ts
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
│   │   │   │   ├── notificaciones.service.ts
│   │   │   │   └── Notificacion.model.ts
│   │   │   ├── publico/              ← Endpoints abiertos sin JWT
│   │   │   ├── metricas/             ← Estadísticas para DashboardHome
│   │   │   └── migracion/
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