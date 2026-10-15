import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { setupAssociations } from './associations.js';
import { Especialidad } from '../modules/especialidades/Especialidad.model.js';
import { Rol } from '../modules/usuarios/Rol.model.js';
import { Usuario } from '../modules/usuarios/Usuario.model.js';

const roles = [
  { name: 'AUTOR', description: 'Profesional que envía manuscritos científicos.' },
  {
    name: 'DDI',
    description: 'Departamento de Docencia e Investigación; valida envíos y asigna revisores.',
  },
  {
    name: 'COMITE',
    description: 'Miembro del Comité Científico que revisa manuscritos y emite dictámenes.',
  },
  {
    name: 'PUBLISHER',
    description: 'Encargado de Publicación / Prensa que prepara y publica artículos.',
  },
  { name: 'ADMIN', description: 'Administrador con control del sistema.' },
] as const;

const specialties = [
  {
    name: 'Clínica Médica',
    description: 'Especialidad de clínica médica del Hospital Interdistrital Evita.',
    active: true,
  },
  {
    name: 'Cirugía General',
    description: 'Especialidad de cirugía general del Hospital Interdistrital Evita.',
    active: true,
  },
  {
    name: 'Pediatría',
    description: 'Especialidad de pediatría del Hospital Interdistrital Evita.',
    active: true,
  },
  {
    name: 'Terapia Intensiva',
    description: 'Especialidad de terapia intensiva del Hospital Interdistrital Evita.',
    active: true,
  },
] as const;

const testUsers = [
  { roleName: 'AUTOR', specialtyName: 'Clínica Médica' },
  { roleName: 'DDI', specialtyName: 'Cirugía General' },
  { roleName: 'COMITE', specialtyName: 'Pediatría' },
  { roleName: 'PUBLISHER', specialtyName: 'Terapia Intensiva' },
  { roleName: 'ADMIN', specialtyName: 'Clínica Médica' },
] as const;

const testPassword = '123456';

const seedDatabase = async (): Promise<void> => {
  setupAssociations();
  await sequelize.authenticate();

  // Create missing tables without altering existing table schemas.
  await sequelize.sync();

  const passwordHash = await bcrypt.hash(testPassword, 10);

  await sequelize.transaction(async (transaction) => {
    for (const role of roles) {
      await Rol.findOrCreate({
        where: { name: role.name },
        defaults: { ...role },
        transaction,
      });
    }

    for (const specialty of specialties) {
      await Especialidad.findOrCreate({
        where: { name: specialty.name },
        defaults: { ...specialty },
        transaction,
      });
    }

    for (const testUser of testUsers) {
      const role = await Rol.findOne({
        where: { name: testUser.roleName },
        transaction,
      });
      const specialty = await Especialidad.findOne({
        where: { name: testUser.specialtyName },
        transaction,
      });

      if (!role || !specialty) {
        throw new Error(
          `Unable to find role "${testUser.roleName}" or specialty "${testUser.specialtyName}".`,
        );
      }

      const username = `test_${testUser.roleName.toLowerCase()}`;
      await Usuario.findOrCreate({
        where: { email: `${username}@example.test` },
        defaults: {
          username,
          email: `${username}@example.test`,
          password: passwordHash,
          first_name: 'Cuenta',
          last_name: `Prueba ${testUser.roleName}`,
          dni: `TEST-${testUser.roleName}`,
          active: true,
          roleId: role.id,
          specialtyId: specialty.id,
        },
        transaction,
      });
    }
  });

  console.info('Database seed completed. Test users (temporary password: 123456):');
  for (const testUser of testUsers) {
    const username = `test_${testUser.roleName.toLowerCase()}`;
    console.info(`- ${username}@example.test (${testUser.roleName})`);
  }
  console.warn('These are development-only test accounts; change the shared password before use.');
};

try {
  await seedDatabase();
} catch (error: unknown) {
  console.error('Database seed failed:', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
