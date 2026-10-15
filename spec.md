# Specification Document (spec.md) - Portal Científico HIEF
**Proyecto:** Plataforma de Divulgación Científica del Hospital Interdistrital Evita (HIEF)  
**Institución:** Instituto Politécnico Formosa "Dr. Alberto Marcelo Zorrilla" (TSDSM)  
**Asignatura:** Práctica Profesional II / Ingeniería de Software II (2026)  
**Autores del Proyecto:** Lautaro Daniel Short, Fernando Agustín Laprida, Leandro Francisco Franco Sian  
**Versión:** 4.0.0 (Spec-Driven TypeScript Architecture)  

---

## 1. Visión General, Propósito y Alcance Legal
Plataforma web digital institucional diseñada para comunicar conocimiento científico, gestionar el flujo editorial de manuscritos (envío, revisión por pares, dictámenes e IA de plagio) y proveer un repositorio público con métricas de uso y descarga.

**Restricción Legal Inquebrantable:** El sistema es exclusivamente académico, científico y bibliográfico. Queda estrictamente prohibido el almacenamiento, procesamiento o tratamiento de historias clínicas, turnos médicos o datos sensibles de pacientes (Ley de Protección de Datos Personales).

---

## 2. Stack Tecnológico
*   **Backend (`/backend`):** Node.js + Express.js, TypeScript (`strict: true`), PostgreSQL (o MariaDB) con ORM Sequelize, `jsonwebtoken` (JWT), `bcrypt`, `multer`.
*   **Microservicio IA (`/ai-service`):** Python 3.11+ + FastAPI. Módulos dedicados para análisis de similitud (`embeddings.py`), detección de plagio (`checker.py`) y validación de checklists (`requirements.py`).
*   **Frontend (`/frontend`):** React 18 + Vite + TypeScript (`.tsx`), Tailwind CSS (estrictamente prohibido estilos en línea), React Router DOM v6, Lucide React, Axios.

---

## 3. Arquitectura de Directorios (Modular / Feature-Based)
*   **Backend:** Organizado por dominios en `backend/src/modules/` (`auth`, `usuarios`, `especialidades`, `articulos`, `editorial`, `biblioteca`, `ai`, `notificaciones`, `metricas`, `migracion`). Las asociaciones de Sequelize se centralizan en `backend/src/database/associations.ts`.
*   **Frontend:** Organizado en `frontend/src/features/` por dominio, `frontend/src/pages/` para vistas de ruta, `frontend/src/layouts/` (`DashboardLayout`, `Sidebar`, `Navbar`), y `frontend/src/api/` para clientes Axios tipados.

---

## 4. Matriz de Roles, Perfiles y Permisos (RBAC)
El sistema reconoce **5 perfiles institucionales operativos** (creados exclusivamente por el Administrador, sin registro público abierto):

1. **INVITADO (Sin Autenticación):** Consulta pública de artículos con estado `PUBLICO` / `PUBLICADO` y descarga de PDFs.
2. **AUTOR (`AUTOR`):** Profesionales que inician sesión para enviar manuscritos (`Article`) y subir nuevas versiones (`ArticleVersion`).
3. **DEPARTAMENTO DE DOCENCIA E INVESTIGACIÓN (`DDI`):** Recibe envíos, valida pertinencia, realiza rechazos en escritorio y asigna manuscritos a los revisores del Comité Científico según especialidad.
4. **MIEMBRO DEL COMITÉ CIENTÍFICO (`COMITE`):** Lee expedientes asignados, ejecuta análisis de IA (plagio/similitud) y emite dictámenes formales (`APROBAR`, `APROBAR_CON_CORRECCIONES`, `RECHAZAR`) con comentarios.
5. **ENCARGADO DE PUBLICACIÓN / PRENSA (`PUBLISHER`):** Revisa el formato final de artículos aprobados, ejecuta la publicación oficial en el portal y maneja la **Carga Masiva de Históricos** (migración de PDFs antiguos).
6. **ADMINISTRADOR (`ADMIN`):** Control total del sistema. Gestiona el CRUD completo de usuarios, habilitación de especialidades médicas (`specialties`), auditoría de logs y configuración general.

---

## 5. Modelo de Datos Esencial (Sequelize TS)
*   `roles`: id, name (`AUTOR`, `DDI`, `COMITE`, `PUBLISHER`, `ADMIN`), description.
*   `specialties`: id, name, description, active (baja lógica).
*   `users`: id, username, email, password, first_name, last_name, dni, active, roleId (FK), specialtyId (FK).
*   `convocations`: id, title, start_date, end_date, active.
*   `articles`: id, title, state (`PENDIENTE`, `EN_REVISION`, `APROBADO`, `RECHAZADO`, `PUBLICADO`), responsibleId (FK), specialtyId (FK), convocationId (FK).
*   `article_versions`: id, version_number, body_text, pdf_path, ai_report (JSON), articleId (FK).
*   `committee_assignments`: id, read_status, reviewerId (FK), articleId (FK).
*   `reviews`: id, verdict, comments, assignmentId (FK), versionId (FK).
*   `library_resources`: id, title, category, file_path, file_size, visibility (`PUBLICO`, `INTERNO`, `CONFIDENCIAL`), uploadedBy (FK), specialtyId (FK).
*   `metrics_logs`: id, action_type (`VISITA`, `DESCARGA`), articleId (FK), ip_hash, timestamp.

---

## 6. Contratos y Estándares API
*   **Formato JSON estándar:** 
    *   Éxito: `{ "success": true, "data": <payload> }`
    *   Error: `{ "success": false, "error": "Mensaje legible" }`
*   **Seguridad:** Autenticación por Bearer Token JWT en cabecera `Authorization`. Contraseñas protegidas con `bcrypt`. Límite de 10 intentos fallidos con bloqueo temporal.
*   **Manejo de Archivos:** Middleware `multer` para filtrado exclusivo de `application/pdf` (máx. 10MB) guardados en almacenamiento local aislado.