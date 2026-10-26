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