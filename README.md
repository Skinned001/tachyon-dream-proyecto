# tachyon-dream-proyecto

## Inicio local de la plataforma

Requisitos: Node.js y npm, Docker Desktop (para iniciar la base local) y dos
terminales de PowerShell.

1. Desde la raíz del proyecto, inicia MariaDB:

   ```powershell
   docker compose up -d db
   ```

2. Crea `backend/.env` con la configuración de desarrollo que coincide con
   `docker-compose.yml`:

   ```dotenv
   DB_DIALECT=mariadb
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=chief_journal
   DB_USER=chief_user
   DB_PASSWORD=chief_pass
   JWT_SECRET=clave-local-de-desarrollo
   PORT=3000
   FRONTEND_ORIGIN=http://localhost:5173
   ```

   Estas credenciales son únicamente para desarrollo local. La base de datos
   debe estar disponible antes de iniciar el backend.

3. En la primera terminal, instala las dependencias, crea las tablas y carga
   los usuarios de prueba; luego inicia el backend:

   ```powershell
   Set-Location backend
   npm ci
   npm run seed
   npm run dev
   ```

   El API queda disponible en `http://localhost:3000`; comprueba su estado en
   `http://localhost:3000/health`.

4. En una segunda terminal, inicia el frontend:

   ```powershell
   Set-Location frontend
   npm ci
   npm run dev
   ```

5. Abre `http://localhost:5173`. La portada es pública; el botón **Acceso
   institucional** lleva al login. El seeder crea, entre otras, la cuenta
   `admin@hief.gob.ar` con la contraseña de desarrollo `Hief2026*`.

La primera vez, el archivo público no mostrará artículos hasta que haya
publicaciones cargadas y en estado `PUBLICADO`. El microservicio de IA no es
necesario para iniciar la portada, el API y el acceso institucional.

## Configuración de la base de datos del backend

Crear `backend/.env` con las variables `DB_DIALECT`, `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER` y `DB_PASSWORD`. `DB_DIALECT` acepta `postgres` o
`mariadb`; si no se especifica, se utiliza PostgreSQL y el puerto por defecto
es 5432 (3306 para MariaDB). Para MariaDB se utiliza el dialecto MySQL de
Sequelize junto con `mysql2`, que es compatible con el protocolo de MariaDB.
Configurar también `JWT_SECRET` para habilitar autenticación; `PORT` permite
cambiar el puerto HTTP del backend y por defecto es 3000. `FRONTEND_ORIGIN`
permite configurar el origen autorizado por CORS y por defecto es
`http://localhost:5173`.
`DB_PASSWORD` puede estar vacía si el usuario de la base no tiene contraseña.

Al iniciar, el backend configura las asociaciones, valida la conexión y
sincroniza los modelos con `alter: true` antes de aceptar peticiones. Revisar
este comportamiento antes de utilizarlo en producción.

Para insertar los roles, especialidades y cuentas de prueba de forma
idempotente, ejecutar desde `backend/`:

```powershell
npm run seed
```

El seeder crea las tablas faltantes sin alterar las existentes y ejecuta la
inserción de datos dentro de una transacción. Las cuentas usan la contraseña
compartida `Hief2026*`; son solo para desarrollo y este seeder no debe
ejecutarse en producción.

## Autenticación

El backend expone `POST /api/auth/login`, `POST /api/auth/logout`,
`GET /api/auth/me`, `GET /api/auth/verify` y
`POST /api/auth/change-password`. No hay registro público. El login devuelve
el token dentro de la respuesta estándar y además lo establece como cookie
HttpOnly; las rutas protegidas aceptan esa cookie o `Authorization: Bearer
<token>`. El cliente Axios usa `withCredentials` para enviar la cookie.
Cambiar la contraseña requiere `currentPassword` y `newPassword`.

## Biblioteca virtual

La biblioteca se expone bajo `/api/biblioteca`. La consulta pública lista
recursos `PUBLICO`; los usuarios autenticados ven los niveles permitidos por
su rol. Solo `ADMIN` puede crear, actualizar o eliminar recursos. Las cargas
usan el campo multipart `file` y aceptan PDF de hasta 10 MB.

## Artículos científicos

El módulo de artículos expone `POST /api/articulos` (multipart con los campos
`title`, `summary`, `specialtyId`, opcionalmente `convocationId`, `keywords`
y `coauthors`, además del PDF en `file`), `GET /api/articulos` y
`PUT /api/articulos/:id/status` con `{ "state": "..." }`. Los autores solo
listan sus propios artículos; DDI, Comité, Publisher y Admin pueden consultar
el listado completo. Los manuscritos comienzan en `EN_REVISION` y su PDF se
registra como la primera versión del artículo. El portal ofrece
`GET /api/articulos/publicados` y
`GET /api/articulos/publicados/:id/pdf` sin autenticación, limitados a artículos
publicados.