# Iniciacion de proyecto - conexion a base de datos:
 




# Seed de roles:
Actúa como Desarrollador Backend Senior. Basándote en #file:spec.md y en la estructura modular existente en /backend, necesito que crees el script de inicialización de datos (Seeder) en `src/database/seed.ts` (o `src/seeders/seed.ts`).

El seeder debe realizar las siguientes operaciones utilizando transacciones de Sequelize:
1. Crear los 5 roles institucionales obligatorios si no existen:
   - `AUTOR`
   - `DDI` (Departamento de Docencia e Investigación)
   - `COMITE` (Miembro del Comité Científico)
   - `PUBLISHER` (Encargado de Publicación / Prensa)
   - `ADMIN` (Administrador)
2. Crear al menos 4 especialidades médicas iniciales del Hospital Interdistrital Evita (ej. Clínica Médica, Cirugía General, Pediatría, Terapia Intensiva).
3. Crear un usuario de prueba por cada rol (con contraseña hasheada usando `bcrypt`, ej. password "123456"), asociándolos correctamente a sus respectivos `roleId` y `specialtyId`.

Agrega un script en el `package.json` del backend llamado `"db:seed"` para poder ejecutar este archivo fácilmente desde la terminal (ej: `ts-node src/database/seed.ts` o su equivalente con node).

## Implementacion jwt,middlewares y roles:

Actúa como Arquitecto Backend Senior en TypeScript. Basándote estrictamente en #file:spec.md, #file:contrato.md y #file:.github/copilot-instructions.md, implementa la infraestructura base de Autenticación JWT, los middlewares de seguridad y el Módulo 1 (`auth`) en `/backend`.

Reglas de negocio obligatorias (Caso de Uso N°3):
- No existe registro público abierto (solo el ADMIN crea usuarios).
- Todas las respuestas deben respetar la interfaz `{ success: boolean, data?: T, error?: string }` definida en `contrato.md`.
- En credenciales inválidas, devolver siempre el mensaje genérico: "Correo o contraseña incorrectos" (HTTP 401).
- Bloqueo temporal tras 10 intentos fallidos (`failed_login_attempts` y `locked_until` por 30 minutos).
- Si `active === false` o la cuenta está bloqueada temporalmente, devolver HTTP 403 con "Cuenta inactiva o bloqueada. Contacte al Administrador".

Genera o actualiza los siguientes archivos en TypeScript estricto (sin usar `any`):

1. `src/types/express.d.ts`:
   Extiende `Request` de Express con `user?: { id: number; role: 'AUTOR' | 'DDI' | 'COMITE' | 'PUBLISHER' | 'ADMIN'; specialtyId: number | null; email: string }`.

2. `src/config/jwt.ts`:
   Funciones tipadas `signToken(payload)` y `verifyToken(token)` usando `jsonwebtoken` (`JWT_SECRET`, `JWT_EXPIRES_IN = '8h'`).

3. `src/middlewares/auth.middleware.ts` y `src/middlewares/role.middleware.ts`:
   - `authenticateJWT`: Valida el header `Authorization: Bearer <token>` e inyecta `req.user`. Si no existe o expiró, responde HTTP 401 `{ success: false, error: "Sesión expirada. Inicie sesión nuevamente" }`.
   - `requireRole(allowedRoles: RoleName[])`: Verifica que `req.user.role` esté incluido en `allowedRoles`. Si no, responde HTTP 403 `{ success: false, error: "No tiene permisos para acceder a esta sección" }`.

4. `src/middlewares/error.middleware.ts`:
   Middleware global de errores para Express que capture cualquier excepción no controlada y devuelva `{ success: false, error: err.message || "Error interno del servidor" }`.

5. Módulo `src/modules/auth/` (`auth.dto.ts`, `auth.service.ts`, `auth.controller.ts`, `auth.routes.ts`):
   Implementa los endpoints del Módulo 1 de `#file:contrato.md`:
   - `POST /api/auth/login`
   - `POST /api/auth/logout` (protegido por `authenticateJWT`)
   - `GET /api/auth/me` (protegido por `authenticateJWT`, devuelve los datos actualizados del usuario)
   - `GET /api/auth/verify` (protegido por `authenticateJWT`, confirma validez del token)
   - `POST /api/auth/change-password` (protegido por `authenticateJWT`, permite cambiar la contraseña y pasa `must_change_password` a `false`)

6. Registra las rutas bajo `/api/auth` y el `error.middleware.ts` en `src/app.ts` (o `src/server.ts`).

# Implementacion de multer con limite de archivos 10mb:
Actúa como Arquitecto Backend Senior en TypeScript. Basándote en #file:spec.md, crea la configuración de subida de archivos en `backend/src/config/multer.ts` utilizando la librería `multer` y el tipado de Node (`fs`, `path`).

Requisitos obligatorios:
1. Define el `storage` usando `multer.diskStorage`.
2. La ruta de destino (`destination`) debe ser dinámica analizando la URL (`req.originalUrl` o `req.baseUrl`):
   - Si la ruta incluye `/biblioteca`, guardar en `uploads/library/`.
   - Si la ruta incluye `/articulos`, guardar en `uploads/articles/`.
   - Usa `fs.existsSync` y `fs.mkdirSync(dir, { recursive: true })` para garantizar que las carpetas existan antes de guardar.
3. El nombre del archivo (`filename`) debe prefijarse con `Date.now()` para evitar colisiones y sanitizar el nombre original (eliminando espacios).
4. Implementa un `fileFilter` estricto que valide que el mimetype sea exclusivamente `application/pdf`. Si es otro formato, rechaza el archivo con un error descriptivo.
5. Configura `limits` estableciendo un tamaño máximo de archivo de 10 MB.
6. Exporta el middleware (ej. `export const uploadPdf = multer({ storage, fileFilter, limits });`).

# Prueba de multer:
Actúa como Desarrollador Backend. Necesito probar la configuración de Multer que acabamos de crear. 

Modifica el archivo principal del servidor (por ejemplo, `backend/src/server.ts` o `app.ts`) para incluir una ruta de prueba temporal. Sigue estos pasos:
1. Importa `uploadPdf` desde `src/config/multer.ts` (recuerda usar la extensión `.js` en la importación si el proyecto usa ES Modules).
2. Justo antes del bloque donde arranca el servidor (`app.listen`), agrega el siguiente endpoint: `app.post('/api/biblioteca/test-upload', uploadPdf.single('file'), ...)`.
3. Dentro del controlador de esta ruta, si `req.file` no existe, retorna HTTP 400 con `{ success: false, error: "No se subió ningún archivo válido" }`.
4. Si el archivo se sube correctamente, retorna HTTP 200 con `{ success: true, data: { message: "Archivo subido con éxito", path: req.file.path, filename: req.file.filename } }`.

# Cerrado de etapa de pruebas de multer:

Actúa como Arquitecto Backend Senior en TypeScript. Basándote estrictamente en #file:spec.md, #file:contrato.md y #file:.github/copilot-instructions.md, necesito implementar el Módulo 9: Biblioteca Virtual en `backend/src/modules/biblioteca/`.

Primero, elimina la ruta temporal `/api/biblioteca/test-upload` que agregamos en `server.ts` (o `app.ts`).

Luego, crea o actualiza los siguientes archivos en TypeScript estricto (sin usar `any`):

1. `src/middlewares/auth.middleware.ts`:
   Agrega y exporta un middleware `optionalAuthenticateJWT`. Si la petición trae un header `Authorization: Bearer <token>` válido, decodifica el token e inyecta `req.user`. Si no trae token o es inválido, simplemente continúa con `next()` dejando `req.user` como `undefined` (sin bloquear la petición).

2. `src/modules/biblioteca/RecursoBiblioteca.model.ts`:
   Verifica o crea el modelo Sequelize `RecursoBiblioteca` (`tableName: 'library_resources'`) con los campos de `spec.md`: `id`, `title`, `category`, `file_path`, `file_size`, `visibility` (ENUM: `'PUBLICO'`, `'INTERNO'`, `'CONFIDENCIAL'`), `uploadedBy` (FK a `users`), `specialtyId` (FK a `specialties`).

3. `src/modules/biblioteca/biblioteca.dto.ts`:
   Define las interfaces de entrada y salida respetando `LibraryResourceDTO` y `LibraryVisibility` de `#file:contrato.md`.

4. `src/modules/biblioteca/biblioteca.service.ts`:
   - `listarRecursos(userRole?: RoleName, filters?: { specialtyId?: number; category?: string; search?: string })`:
     Filtra dinámicamente por visibilidad según el rol:
     * Si no hay `userRole` (visitante público): solo devuelve `visibility = 'PUBLICO'`.
     * Si `userRole` es `'AUTOR'` o `'PUBLISHER'`: devuelve `'PUBLICO'` e `'INTERNO'`.
     * Si `userRole` es `'DDI'`, `'COMITE'` o `'ADMIN'`: devuelve `'PUBLICO'`, `'INTERNO'` y `'CONFIDENCIAL'`.
     Incluye los datos de la `Especialidad` asociada.
   - `obtenerPorId(id: number, userRole?: RoleName)`: Obtiene el detalle validando que el rol del usuario tenga permiso para ver ese nivel de `visibility`.
   - `crearRecurso(data, file: Express.Multer.File, uploadedBy: number)`: Calcula `file_size` legible (ej. en KB/MB a partir de `file.size`), guarda `file_path` y crea el registro en BD.
   - `actualizarRecurso(id: number, data)`: Actualiza `title`, `category`, `visibility` o `specialtyId`.
   - `eliminarRecurso(id: number)`: Busca el recurso, elimina el archivo PDF físico del disco usando `fs.unlinkSync` (si existe) y elimina el registro de la base de datos.

5. `src/modules/biblioteca/biblioteca.controller.ts` y `src/modules/biblioteca/biblioteca.routes.ts`:
   Implementa los endpoints del Módulo 9 de `#file:contrato.md`:
   - `GET /` (usa `optionalAuthenticateJWT`)
   - `GET /:id` (usa `optionalAuthenticateJWT`)
   - `POST /` (protegido por `authenticateJWT`, `requireRole(['ADMIN'])` y `uploadPdf.single('file')`)
   - `PUT /:id` (protegido por `authenticateJWT` y `requireRole(['ADMIN'])`)
   - `DELETE /:id` (protegido por `authenticateJWT` y `requireRole(['ADMIN'])`)

6. Conecta `bibliotecaRoutes` en `src/server.ts` (o `src/app.ts`) bajo el prefijo `/api/biblioteca`.

# Generacion de motor y flujo de articulos:

Actúa como Arquitecto Backend Senior en TypeScript. Basándote en #file:spec.md y #file:contrato.md, necesitamos implementar el Módulo de Artículos (Manuscritos) en `src/modules/articulos/`.

Crea o actualiza los siguientes archivos en TypeScript estricto:

1. `src/modules/articulos/Articulo.model.ts`:
   Define el modelo Sequelize `Articulo` (`tableName: 'articles'`) con los campos: `id`, `title`, `abstract` (texto largo), `file_path` (string), `status` (ENUM: `'EN_REVISION'`, `'APROBADO'`, `'RECHAZADO'`, `'PUBLICADO'`), `authorId` (FK a `users`), `specialtyId` (FK a `specialties`).

2. `src/modules/articulos/articulo.service.ts`:
   - `crearArticulo(data, file: Express.Multer.File, authorId: number)`: Guarda el PDF (Multer) e inserta en la BD con status inicial `'EN_REVISION'`.
   - `listarArticulos(user)`: 
     * Si el rol es `AUTOR`: devuelve solo los artículos donde `authorId === user.id`.
     * Si el rol es `COMITE`, `PUBLISHER` o `ADMIN`: devuelve todos los artículos.
   - `actualizarEstado(id: number, nuevoEstado: string, revisorId: number)`: Permite al comité cambiar el estado del manuscrito.

3. `src/modules/articulos/articulo.controller.ts` y `src/modules/articulos/articulo.routes.ts`:
   - `POST /` (protegido por `authenticateJWT`, `requireRole(['AUTOR', 'ADMIN'])` y `uploadPdf.single('file')`).
   - `GET /` (protegido por `authenticateJWT`).
   - `PUT /:id/status` (protegido por `authenticateJWT` y `requireRole(['COMITE', 'ADMIN'])`).

4. Conecta las rutas en `src/server.ts` bajo el prefijo `/api/articulos`.

# Estructuracion del maquetado del diseño:

Actúa como Desarrollador Frontend Senior (React, TypeScript, Tailwind). Estamos migrando la interfaz visual del proyecto HIEF respetando estrictamente `spec.md` y `contrato.md`.

Ejecuta esta Fase 1 (Estilos, Red y Autenticación). Modifica los siguientes archivos en la carpeta `frontend/`:

1. Sobrescribe `frontend/src/index.css` con este contenido exacto para establecer la paleta institucional y fuentes:
```css
@import url('[https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap](https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap)');
@import "tailwindcss";

:root {
  font-family: 'DM Sans', sans-serif;
  color: #173d3b;
  background: #f2f7f4;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --ink: #173d3b;
  --muted: #526e68;
  --line: #d5e6df;
  --canvas: #f2f7f4;
  --surface: #fcfefd;
  --teal: #087d70;
  --teal-dark: #07584f;
  --mint: #d8f1e8;
  --gold: #a96612;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; min-height: 100vh; background: var(--canvas); }
button, input { font: inherit; }
button { cursor: pointer; }
::selection { background: #a8e8d5; color: #123b37; }
:focus-visible { outline: 3px solid #e09a27; outline-offset: 3px; }
.font-editorial { font-family: 'Newsreader', Georgia, serif; }
.font-data { font-family: 'DM Mono', monospace; }
.page-enter { animation: enter .5s cubic-bezier(.2,.7,.2,1) both; }
@keyframes enter { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
.grain::after {
  content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 50; opacity: .12;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='[http://www.w3.org/2000/svg'%3E%3Cfilter](http://www.w3.org/2000/svg'%3E%3Cfilter) id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.94' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.14'/%3E%3C/svg%3E");
}
.scrollbar-subtle::-webkit-scrollbar { width: 6px; height: 6px; }
.scrollbar-subtle::-webkit-scrollbar-thumb { background: #9fcfc0; border-radius: 99px; }
