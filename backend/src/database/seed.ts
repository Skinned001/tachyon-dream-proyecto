import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { Especialidad } from '../modules/especialidades/Especialidad.model.js';
import { Rol } from '../modules/usuarios/Rol.model.js';
import { Usuario } from '../modules/usuarios/Usuario.model.js';
import { setupAssociations } from './associations.js';
import { synchronizeRoles } from './roles.js';

const specialties = [
  {
    name: 'Clínica Médica',
    description: 'Especialidad de Clínica Médica.',
    active: true,
  },
  {
    name: 'Cirugía General',
    description: 'Especialidad de Cirugía General.',
    active: true,
  },
  {
    name: 'Pediatría',
    description: 'Especialidad de Pediatría.',
    active: true,
  },
  {
    name: 'Terapia Intensiva',
    description: 'Especialidad de Terapia Intensiva.',
    active: true,
  },
] as const;

const seedUsers = [
  {
    username: 'admin',
    email: 'admin@hief.gob.ar',
    first_name: 'Administrador',
    last_name: 'HIEF',
    dni: 'SEED-ADMIN',
    roleName: 'ADMIN',
    specialtyName: null,
  },
  {
    username: 'docencia',
    email: 'docencia@hief.gob.ar',
    first_name: 'Docencia',
    last_name: 'HIEF',
    dni: 'SEED-DDI',
    roleName: 'DDI',
    specialtyName: null,
  },
  {
    username: 'comite',
    email: 'comite@hief.gob.ar',
    first_name: 'Comité',
    last_name: 'Científico',
    dni: 'SEED-COMITE',
    roleName: 'COMITE',
    specialtyName: 'Clínica Médica',
  },
  {
    username: 'editor',
    email: 'editor@hief.gob.ar',
    first_name: 'Editor',
    last_name: 'HIEF',
    dni: 'SEED-EDITOR',
    roleName: 'EDITOR',
    specialtyName: null,
  },
  {
    username: 'autor',
    email: 'autor@hief.gob.ar',
    first_name: 'Autor',
    last_name: 'HIEF',
    dni: 'SEED-STAFF-AUTHOR',
    roleName: 'STAFF',
    is_author: true,
    specialtyName: 'Pediatría',
  },
] as const;

const seedDatabase = async (): Promise<void> => {
  setupAssociations();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  await synchronizeRoles();

  const passwordHash = await bcrypt.hash('Hief2026*', 10);

  await sequelize.transaction(async (transaction) => {
    for (const specialty of specialties) {
      await Especialidad.findOrCreate({
        where: { name: specialty.name },
        defaults: { ...specialty },
        transaction,
      });
    }

    for (const userData of seedUsers) {
      const role = await Rol.findOne({
        where: { name: userData.roleName },
        transaction,
      });

      const specialty = userData.specialtyName
        ? await Especialidad.findOne({
            where: { name: userData.specialtyName },
            transaction,
          })
        : null;

      if (!role || (userData.specialtyName && !specialty)) {
        throw new Error(`Required role or specialty is missing for ${userData.email}.`);
      }

      await Usuario.findOrCreate({
        where: { email: userData.email },
        defaults: {
          username: userData.username,
          email: userData.email,
          password: passwordHash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          dni: userData.dni,
          is_author: 'is_author' in userData ? userData.is_author : false,
          active: true,
          roleId: role.id,
          specialtyId: specialty?.id ?? null,
          must_change_password: false,
        },
        transaction,
      });
    }
  });

  console.info('Database seed completed.');
  console.info(`Synchronized 5 roles, ${specialties.length} specialties, and ${seedUsers.length} users.`);
  console.warn('Seed accounts use a shared development password. Change it before real deployment.');
};

try {
  await seedDatabase();
} catch (error: unknown) {
  console.error('Database seed failed:', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
