# Specification Document (spec.md) - HIEF Journal & Biblioteca Virtual
**Proyecto:** Plataforma de Gestión de Producción Científica y Biblioteca Virtual (HIE)
**Cliente:** Hospital Interdistrital Evita (HIE) - Formosa
**Marco Académico:** TSDSM - Instituto Politécnico Formosa (Práctica Profesional III)
**Versión:** 3.0.0 (TypeScript + Modular Architecture + FastAPI AI Microservice)

---

## 1. Objeto y Límite Legal Estricto
Plataforma web con Sistema de Gestión de Contenidos (CMS) para administrar el flujo de redacción, revisión por pares (con asistencia de IA para detección de plagio, similitud y control ortotipográfico) y publicación de artículos científicos, junto con una Biblioteca Virtual institucional con control de visibilidad.

**Restricción Legal Inquebrantable:** El sistema es exclusivamente académico y bibliográfico. Queda prohibido crear modelos, rutas o vistas que almacenen historias clínicas, turnos médicos o datos sensibles de pacientes.

---

## 2. Stack Tecnológico y Convenciones de Código
*   **Lenguaje Principal:** **TypeScript** (`strict: true`) tanto en `/backend` como en `/frontend`. Prohibido el uso indiscriminado de `any`.
*   **Backend (`/backend`):** Node.js, Express, Sequelize (`sequelize` con clases tipadas `Model<InferAttributes<T>, InferCreationAttributes<T>>`), `jsonwebtoken`, `bcrypt`, `multer`, AdminJS (`config/admin.ts`).
*   **Microservicio IA (`/ai-service`):** Python 3.11+, FastAPI. Expone endpoints internos para análisis de similitud (`embeddings.py`), plagio (`checker.py`) y checklists (`requirements.py`), consumidos desde el módulo `backend/src/modules/ai/` (junto con proveedores LLM como Ollama).
*   **Frontend (`/frontend`):** React 18 + Vite + TypeScript (`.tsx`), Tailwind CSS (prohibido usar estilos inline `style={{}}`), React Router DOM v6, Lucide React, Axios.

---

## 3. Arquitectura Modular y Regla de Asociaciones
### Backend (`backend/src/modules/<modulo>/`)
Cada módulo contiene su propio `*.routes.ts`, `*.controller.ts`, `*.service.ts` y sus modelos `*.model.ts`.
*   **Regla Crítica de Sequelize en TS:** Los archivos `*.model.ts` solo definen la clase y columnas del modelo (`Model.init`). **NUNCA** declares relaciones (`hasMany`, `belongsTo`) dentro de `*.model.ts` para evitar dependencias circulares. Todas las relaciones se declaran exclusivamente en `backend/src/database/associations.ts`.

### Frontend (`frontend/src/`)
*   `pages/`: Contiene las vistas de página completa (`DashboardHome.tsx`, `BibliotecaHome.tsx`, `MisArticulos.tsx`, `Revisiones.tsx`, `Login.tsx`, `Registro.tsx`).
*   `features/<modulo>/`: Contiene sub-componentes complejos, tablas y modales propios de cada módulo (ej. `features/biblioteca/UploadLibraryModal.tsx`).
*   `layouts/`: Contiene `DashboardLayout.tsx`, `Sidebar.tsx`, `Navbar.tsx` y `LogoutButton.tsx`.
*   `api/`: Contiene `axiosClient.ts` (con interceptor JWT) y un archivo `*.api.ts` por cada módulo del backend.

---

## 4. Modelo de Datos Relacional (Sequelize TypeScript)

1. **`Rol` (tabla: `roles` | módulo: `usuarios`)**
   * `id`: number (PK), `name`: `'AUTOR' | 'COMITE' | 'ADMIN'`, `description`: string.

2. **`Especialidad` (tabla: `specialties` | módulo: `especialidades`)**
   * `id`: number (PK), `name`: string, `active`: boolean (default `true`).

3. **`Usuario` (tabla: `users` | módulo: `usuarios`)**
   * `id`: number (PK), `username`: string (unique), `email`: string (unique), `password`: string, `first_name`: string, `last_name`: string, `dni`: string | null, `active`: boolean (default `true`), `roleId`: number (FK), `specialtyId`: number | null (FK).

4. **`Convocatoria` (tabla: `convocations` | módulo: `editorial`)**
   * `id`: number (PK), `title`: string, `start_date`: Date, `end_date`: Date, `active`: boolean.

5. **`Articulo` (tabla: `articles` | módulo: `articulos`)**
   * `id`: number (PK), `title`: string, `state`: `'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO'` (default `'PENDIENTE'`), `responsibleId`: number (FK -> `users.id`), `specialtyId`: number (FK), `convocationId`: number (FK).

6. **`ArticuloVersion` (tabla: `article_versions` | módulo: `articulos`)**
   * `id`: number (PK), `version_number`: number, `body_text`: string | null (LONGTEXT), `pdf_path`: string | null, `ai_report`: object | null (JSON con resultado de FastAPI/Ollama), `articleId`: number (FK).

7. **`AsignacionComite` (tabla: `committee_assignments` | módulo: `editorial`)**
   * `id`: number (PK), `read_status`: boolean (default `false`), `reviewerId`: number (FK -> `users.id`), `articleId`: number (FK).

8. **`Revision` (tabla: `reviews` | módulo: `editorial`)**
   * `id`: number (PK), `verdict`: `'APROBAR' | 'RECHAZAR' | 'CORREGIR'`, `comments`: string, `review_date`: Date, `assignmentId`: number (FK), `versionId`: number (FK).

9. **`RecursoBiblioteca` (tabla: `library_resources` | módulo: `biblioteca`)**
   * `id`: number (PK), `title`: string, `category`: string, `file_path`: string, `file_size`: string, `visibility`: `'PUBLICO' | 'INTERNO' | 'CONFIDENCIAL'` (default `'PUBLICO'`), `uploadedBy`: number (FK -> `users.id`), `specialtyId`: number (FK).

10. **`Notificacion` (tabla: `notifications` | módulo: `notificaciones`)**
    * `id`: number (PK), `userId`: number (FK -> `users.id`), `title`: string, `message`: string, `read`: boolean (default `false`).

---

## 5. Matriz de Permisos (RBAC) y Reglas de Negocio
*   **Invitado (Rutas `/api/publico`):** Solo visualiza artículos `APROBADO` y recursos de biblioteca con `visibility === 'PUBLICO'`.
*   **`AUTOR`:** Visualiza recursos `PUBLICO` e `INTERNO`. Crea artículos y nuevas versiones.
*   **`COMITE`:** Hereda permisos de `AUTOR`. Visualiza recursos `PUBLICO`, `INTERNO` y `CONFIDENCIAL`. Evalúa artículos asignados, ejecuta chequeos del módulo `ai` y emite dictámenes en `reviews`.
*   **`ADMIN`:** Acceso total. Único rol autorizado a ejecutar `POST /api/biblioteca` (subir PDFs a la Biblioteca), crear convocatorias y asignar revisores.

---

## 6. Contratos de Respuesta API y Tipado Compartido
Toda respuesta HTTP de los controladores de Express debe cumplir con la interfaz genérica:
```typescript
export interface ApiResponse<T unknown> {
  success: boolean;
  data?: T;
  error?: string;
}