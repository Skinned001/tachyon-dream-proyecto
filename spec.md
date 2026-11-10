# Specification Document (spec.md) - Portal Científico HIEF
**Proyecto:** Plataforma de Divulgación Científica del Hospital Interdistrital Evita (HIEF)  
**Institución:** Instituto Politécnico Formosa "Dr. Alberto Marcelo Zorrilla" (TSDSM)  
**Asignatura:** Práctica Profesional II / Ingeniería de Software II (2026)  
**Autores del Proyecto:** Lautaro Daniel Short, Fernando Agustín Laprida, Leandro Francisco Franco Sian  
**Versión:** 4.0.0 (Spec-Driven TypeScript Architecture)  

---

## 1. Visión General, Propósito y Alcance Legal
Plataforma web digital institucional diseñada para comunicar conocimiento científico, gestionar el flujo editorial de manuscritos (envío, revisión por pares, dictámenes y análisis asistido de documentos) y proveer un repositorio público con métricas de uso y descarga.

**Restricción Legal Inquebrantable:** El sistema es exclusivamente académico, científico y bibliográfico. Queda estrictamente prohibido el almacenamiento, procesamiento o tratamiento de historias clínicas, turnos médicos o datos sensibles de pacientes (Ley de Protección de Datos Personales).

---

## 2. Stack Tecnológico
*   **Backend (`/backend`):** Node.js + Express.js, TypeScript (`strict: true`), PostgreSQL (o MariaDB) con ORM Sequelize, `jsonwebtoken` (JWT), `bcrypt`, `multer`.
*   **Microservicio IA (`/ai-service`):** Python 3.11+ + FastAPI. El alcance propuesto del primer MVP es una checklist editorial explicable y aprobada por el equipo editorial. El análisis de similitud es una etapa independiente, pendiente de corpus autorizado y protocolo de evaluación; sus resultados no constituyen dictámenes de plagio. Ver la [especificación SDD del módulo de IA](./ai-service/spec.md).
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
4. **MIEMBRO DEL COMITÉ CIENTÍFICO (`COMITE`):** Lee expedientes asignados, puede revisar análisis asistidos como apoyo (sin que estos determinen plagio ni reemplacen la evaluación humana) y emite dictámenes formales (`APROBAR`, `APROBAR_CON_CORRECCIONES`, `RECHAZAR`) con comentarios.
5. **ENCARGADO DE PUBLICACIÓN / PRENSA (`PUBLISHER`):** Revisa el formato final de artículos aprobados, ejecuta la publicación oficial en el portal y maneja la **Carga Masiva de Históricos** (migración de PDFs antiguos).
6. **ADMINISTRADOR (`ADMIN`):** Control total del sistema. Gestiona el CRUD completo de usuarios, habilitación de especialidades médicas (`specialties`), auditoría de logs y configuración general.

## 4.1 Portal público y acceso institucional

La ruta inicial (`/`) presenta dos accesos claramente diferenciados:

- **Portal público:** no requiere autenticación. Permite consultar manuscritos
  publicados de este año y de años anteriores, buscar por texto, filtrar por
  año, ver sus metadatos editoriales y descargar el PDF publicado.
- **Acceso institucional:** dirige al inicio de sesión de autores y personal
  hospitalario. No hay registro público; las cuentas son creadas por un
  administrador.

La API pública solo devuelve artículos con estado `PUBLICADO`. No expone
borradores, manuscritos en revisión, dictámenes, reportes de IA, identificadores
de responsables ni rutas internas de archivos. La descarga también verifica
que el artículo siga publicado y que exista un PDF asociado. Un artículo sin
PDF no ofrece una descarga.

La ficha pública muestra título, resumen si está disponible, palabras clave,
especialidad, coautores si fueron declarados y año de publicación (derivado de
la fecha disponible del artículo hasta que exista una fecha editorial
específica). El estilo visual reutiliza la paleta institucional definida en el
frontend.

**Criterios de aceptación**

1. Una persona sin sesión puede abrir `/`, ver publicaciones actuales e
   históricas, buscar y filtrar por año.
2. Desde una publicación con PDF disponible, una persona puede descargarlo sin
   iniciar sesión.
3. Las rutas públicas nunca devuelven artículos no publicados ni sus archivos.
4. El acceso institucional lleva al login; después de autenticarse, la ruta
   inicial del área privada es `/dashboard`.
5. Si falla la carga del archivo público, la interfaz informa el problema y
   permite reintentar; no presenta resultados de ejemplo como si fueran datos
   reales.

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
*   **Documento de Contratos (Fuente de la Verdad de Endpoints y DTOs):** Todos los endpoints por módulo, métodos HTTP, roles requeridos y estructuras de payloads/responses están definidos obligatoriamente en el archivo [`Contrato.md`](./Contrato.md) ubicado en la raíz del proyecto. El contrato de IA sigue pendiente de aprobación; la propuesta está en la [especificación del módulo](./ai-service/spec.md).
*   **Formato JSON estándar:** 
    *   Éxito: `{ "success": true, "data": <payload> }`
    *   Error: `{ "success": false, "error": "Mensaje legible" }`
*   **Seguridad:** Autenticación por Bearer Token JWT en cabecera `Authorization`. Contraseñas protegidas con `bcrypt`. Límite de 10 intentos fallidos con bloqueo temporal.
*   **Manejo de Archivos:** Middleware `multer` para filtrado exclusivo de `application/pdf` (máx. 10MB) guardados en almacenamiento local aislado.
