import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { Especialidad } from '../especialidades/Especialidad.model.js';
import { isRoleName, type RoleName } from '../auth/auth.dto.js';
import { Rol } from './Rol.model.js';
import { Usuario } from './Usuario.model.js';

export interface UsuarioDTO {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  dni: string;
  role: RoleName;
  specialtyId: number | null;
  must_change_password: boolean;
  active: boolean;
}

export interface CreateUsuarioData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  dni: string;
  role: RoleName;
  specialtyId?: number | null;
}

export class UsuariosError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'UsuariosError';
  }
}

const createTemporaryPassword = (): string =>
  randomBytes(18).toString('base64url');

const toUsuarioDTO = (usuario: Usuario, roleName: string): UsuarioDTO => {
  if (!isRoleName(roleName)) {
    throw new Error(`El usuario ${usuario.id} tiene un rol no válido.`);
  }

  return {
    id: usuario.id,
    username: usuario.username,
    email: usuario.email,
    first_name: usuario.first_name,
    last_name: usuario.last_name,
    dni: usuario.dni,
    role: roleName,
    specialtyId: usuario.specialtyId,
    must_change_password: usuario.must_change_password,
    active: usuario.active,
  };
};

const findUsuarioOrThrow = async (id: number): Promise<Usuario> => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw new UsuariosError(404, 'Usuario no encontrado');
  }
  return usuario;
};

export class UsuariosService {
  async findAll(): Promise<UsuarioDTO[]> {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Rol, as: 'role', attributes: ['id', 'name'] }],
      order: [['id', 'ASC']],
    });

    return usuarios.map((usuario) => {
      const roleName = usuario.role?.name;
      if (!roleName) {
        throw new Error(`No se encontró el rol del usuario ${usuario.id}.`);
      }
      return toUsuarioDTO(usuario, roleName);
    });
  }

  async create(
    input: CreateUsuarioData,
  ): Promise<{ user: UsuarioDTO; temporaryPassword: string }> {
    return sequelize.transaction(async (transaction) => {
      const duplicate = await Usuario.findOne({
        where: {
          [Op.or]: [
            { username: input.username },
            { email: input.email },
            { dni: input.dni },
          ],
        },
        transaction,
      });
      if (duplicate) {
        throw new UsuariosError(
          409,
          'El nombre de usuario, correo o DNI ya está registrado',
        );
      }

      const role = await Rol.findOne({
        where: { name: input.role },
        transaction,
      });
      if (!role) {
        throw new UsuariosError(400, 'El rol seleccionado no existe');
      }

      const specialtyId = input.specialtyId ?? null;
      if (specialtyId !== null) {
        const specialty = await Especialidad.findByPk(specialtyId, { transaction });
        if (!specialty || !specialty.active) {
          throw new UsuariosError(400, 'La especialidad seleccionada no existe o está inactiva');
        }
      }

      const temporaryPassword = createTemporaryPassword();
      const password = await bcrypt.hash(temporaryPassword, 10);
      const usuario = await Usuario.create(
        {
          username: input.username,
          email: input.email,
          first_name: input.first_name,
          last_name: input.last_name,
          dni: input.dni,
          password,
          roleId: role.id,
          specialtyId,
          must_change_password: true,
          active: true,
        },
        { transaction },
      );

      return {
        user: toUsuarioDTO(usuario, role.name),
        temporaryPassword,
      };
    });
  }

  async suspend(id: number, requesterId: number): Promise<void> {
    const usuario = await findUsuarioOrThrow(id);
    if (usuario.id === requesterId) {
      throw new UsuariosError(400, 'No puede suspender su propia cuenta');
    }

    usuario.active = false;
    await usuario.save();
  }

  async resetPassword(id: number): Promise<{ temporaryPassword: string }> {
    const usuario = await findUsuarioOrThrow(id);
    const temporaryPassword = createTemporaryPassword();
    usuario.password = await bcrypt.hash(temporaryPassword, 10);
    usuario.must_change_password = true;
    usuario.failed_login_attempts = 0;
    usuario.locked_until = null;
    await usuario.save();

    return { temporaryPassword };
  }
}
