import { sequelize } from '../config/database.js';
import { Usuario } from '../modules/usuarios/Usuario.model.js';
import { Rol } from '../modules/usuarios/Rol.model.js';

const roles = [
  { name: 'STAFF', description: 'Profesional del sistema.' },
  { name: 'DDI', description: 'Departamento de Docencia e Investigación.' },
  { name: 'COMITE', description: 'Miembro del Comité Científico.' },
  { name: 'EDITOR', description: 'Editor de publicaciones.' },
  { name: 'ADMIN', description: 'Administrador del sistema.' },
] as const;

const legacyRoles = [
  { oldName: 'AUTOR', newName: 'STAFF', isAuthor: true },
  { oldName: 'MEDICO', newName: 'STAFF', isAuthor: false },
  { oldName: 'PUBLISHER', newName: 'EDITOR', isAuthor: false },
] as const;

export const synchronizeRoles = async (): Promise<void> => {
  await sequelize.transaction(async (transaction) => {
    for (const legacyRole of legacyRoles) {
      const oldRole = await Rol.findOne({
        where: { name: legacyRole.oldName },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!oldRole) continue;

      const currentRole = await Rol.findOne({
        where: { name: legacyRole.newName },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (legacyRole.isAuthor) {
        await Usuario.update(
          { is_author: true },
          { where: { roleId: oldRole.id }, transaction },
        );
      }

      if (currentRole) {
        await Usuario.update(
          { roleId: currentRole.id },
          { where: { roleId: oldRole.id }, transaction },
        );
        await oldRole.destroy({ transaction });
      } else {
        oldRole.name = legacyRole.newName;
        const roleDefinition = roles.find(
          (role) => role.name === legacyRole.newName,
        );
        if (!roleDefinition) {
          throw new Error(`Missing definition for role ${legacyRole.newName}.`);
        }
        oldRole.description = roleDefinition.description;
        await oldRole.save({ transaction });
      }
    }

    for (const role of roles) {
      await Rol.findOrCreate({
        where: { name: role.name },
        defaults: { ...role },
        transaction,
      });
    }
  });
};
