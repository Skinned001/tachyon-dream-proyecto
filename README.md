# tachyon-dream-proyecto

## Configuración de la base de datos del backend

Crear `backend/.env` con las variables `DB_DIALECT`, `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER` y `DB_PASSWORD`. `DB_DIALECT` acepta `postgres` o
`mariadb`; si no se especifica, se utiliza PostgreSQL y el puerto por defecto
es 5432 (3306 para MariaDB). Para MariaDB se utiliza el dialecto MySQL de
Sequelize junto con `mysql2`, que es compatible con el protocolo de MariaDB.
`PORT` permite cambiar el puerto HTTP del backend y por defecto es 4000.
`DB_PASSWORD` puede estar vacía si el usuario de la base no tiene contraseña.

Al iniciar, el backend configura las asociaciones, valida la conexión y
sincroniza los modelos con `alter: true` antes de aceptar peticiones. Revisar
este comportamiento antes de utilizarlo en producción.

Para insertar los roles, especialidades y usuarios de prueba de forma
idempotente, ejecutar desde `backend/`:

```powershell
npm run db:seed
```

El seeder crea las tablas faltantes sin alterar las existentes y ejecuta la
inserción de datos dentro de una transacción. Las cuentas `test_<rol>@example.test`
usan temporalmente la contraseña `123456`; son solo para desarrollo y deben
modificarse antes de cualquier uso real.