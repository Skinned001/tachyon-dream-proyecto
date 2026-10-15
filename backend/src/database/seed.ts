import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { Especialidad } from '../modules/especialidades/Especialidad.model.js';
import { Rol } from '../modules/usuarios/Rol.model.js';
import { Usuario } from '../modules/usuarios/Usuario.model.js';
import { setupAssociations } from './associations.js';

const roles = [
  { name: 'AUTOR', description: 'Profesional que envía manuscritos científicos.' },
  {
    name: 'DDI',
    description: 'Departamento de Docencia e Investigación.',
  },
  {
    name: 'COMITE',
    description: 'Miembro del Comité Científico.',
  },
  {
    name: 'PUBLISHER',
    description: 'Encargado de Publicación / Prensa.',
  },
  { name: 'ADMIN', description: 'Administrador del sistema.' },
] as const;

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
    username: 'prensa',
    email: 'prensa@hief.gob.ar',
    first_name: 'Prensa',
    last_name: 'HIEF',
    dni: 'SEED-PUBLISHER',
    roleName: 'PUBLISHER',
    specialtyName: null,
  },
  {
    username: 'autor',
    email: 'autor@hief.gob.ar',
    first_name: 'Autor',
    last_name: 'HIEF',
    dni: 'SEED-AUTOR',
    roleName: 'AUTOR',
    specialtyName: 'Pediatría',
  },
] as const;

const seedDatabase = async (): Promise<void> => {
  setupAssociations();
  await sequelize.authenticate();
  await sequelize.sync();

  const passwordHash = await bcrypt.hash('Hief2026*', 10);

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
  console.info(`Created or confirmed ${roles.length} roles, ${specialties.length} specialties, and ${seedUsers.length} users.`);
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
