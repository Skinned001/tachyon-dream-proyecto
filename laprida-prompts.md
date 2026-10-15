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