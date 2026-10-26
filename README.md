# tachyon-dream-proyecto

## Configuración de la base de datos del backend

Crear `backend/.env` con las variables `DB_DIALECT`, `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER` y `DB_PASSWORD`. `DB_DIALECT` acepta `postgres` o
`mariadb`; si no se especifica, se utiliza PostgreSQL y el puerto por defecto
es 5432 (3306 para MariaDB). Para MariaDB se utiliza el dialecto MySQL de
Sequelize junto con `mysql2`, que es compatible con el protocolo de MariaDB.
Configurar también `JWT_SECRET` para habilitar autenticación; `PORT` permite
cambiar el puerto HTTP del backend y por defecto es 4000. `FRONTEND_ORIGIN`
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
registra como la primera versión del artículo.