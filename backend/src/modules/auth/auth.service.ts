import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { signToken, type AuthTokenPayload } from '../../config/jwt.js';
import { sequelize } from '../../config/database.js';
import { Especialidad } from '../especialidades/Especialidad.model.js';
import { Notificacion } from '../notificaciones/Notificacion.model.js';
import { Rol } from '../usuarios/Rol.model.js';
import { Usuario } from '../usuarios/Usuario.model.js';
import {
  isRoleName,
  type AuthUser,
  type LoginResponse,
  type RegisterRequest,
} from './auth.dto.js';

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_image?: string | null;
  specialtyId?: number | null;
}

const MAX_FAILED_LOGIN_ATTEMPTS = 10;
const ACCOUNT_LOCK_DURATION_MS = 30 * 60 * 1000;

export class AuthError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

type LoginResult =
  | { kind: 'success'; data: LoginResponse }
  | { kind: 'invalid' }
  | { kind: 'blocked' };

const toAuthUser = (
  user: Usuario,
  roleName: string,
): AuthUser => {
  if (!isRoleName(roleName)) {
    throw new Error(`User ${user.id} has an unsupported role.`);
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    profile_image: user.profile_image,
    role: roleName,
    is_author: user.is_author,
    specialtyId: user.specialtyId,
    must_change_password: user.must_change_password,
  };
};

export class AuthService {
  async register(
    input: RegisterRequest,
    credentialFilename?: string,
  ): Promise<void> {
    await sequelize.transaction(async (transaction) => {
      const duplicate = await Usuario.findOne({
        where: {
          [Op.or]: [
            { username: input.username },
            { email: input.email },
            { dni: input.dni },
          ],
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (duplicate) {
        throw new AuthError(
          409,
          'El nombre de usuario, correo o DNI ya está registrado',
        );
      }

      const staffRole = await Rol.findOne({
        where: { name: 'STAFF' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!staffRole) {
        throw new Error('No se encontró el rol STAFF para registrar al usuario.');
      }

      const specialtyId = input.specialtyId ?? null;
      if (specialtyId !== null) {
        const specialty = await Especialidad.findByPk(specialtyId, { transaction });
        if (!specialty || !specialty.active) {
          throw new AuthError(400, 'La especialidad seleccionada no existe o está inactiva');
        }
      }

      const user = await Usuario.create(
        {
          username: input.username,
          email: input.email,
          password: await bcrypt.hash(input.password, 10),
          first_name: input.first_name,
          last_name: input.last_name,
          dni: input.dni,
          is_author: true,
          is_guest: true,
          active: false,
          roleId: staffRole.id,
          specialtyId,
          must_change_password: false,
          registration_comments: input.comentarios ?? null,
          credential_filename: credentialFilename ?? null,
        },
        { transaction },
      );

      const adminRole = await Rol.findOne({
        where: { name: 'ADMIN' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!adminRole) {
        throw new Error('No se encontró el rol ADMIN para notificar el registro.');
      }
      const administrators = await Usuario.findAll({
        where: { roleId: adminRole.id, active: true },
        attributes: ['id'],
        transaction,
      });
      if (administrators.length > 0) {
        await Notificacion.bulkCreate(
          administrators.map((admin) => ({
            userId: admin.id,
            title: 'Solicitud de registro pendiente',
            message: `${user.first_name} ${user.last_name} (${user.username}) solicitó habilitar su cuenta.`,
            read: false,
          })),
          { transaction },
        );
      }
    });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const result = await sequelize.transaction<LoginResult>(async (transaction) => {
      const user = await Usuario.findOne({
        where: { email },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!user) {
        return { kind: 'invalid' };
      }

      if (!user.active || (user.locked_until && user.locked_until.getTime() > Date.now())) {
        return { kind: 'blocked' };
      }

      if (user.locked_until) {
        user.locked_until = null;
        user.failed_login_attempts = 0;
      }

      const passwordIsValid = await bcrypt.compare(password, user.password);
      if (!passwordIsValid) {
        user.failed_login_attempts += 1;
        if (user.failed_login_attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
          user.locked_until = new Date(Date.now() + ACCOUNT_LOCK_DURATION_MS);
        }
        await user.save({ transaction });
        return { kind: 'invalid' };
      }

      const role = await Rol.findByPk(user.roleId, { transaction });
      if (!role) {
        throw new Error(`Role ${user.roleId} was not found for user ${user.id}.`);
      }
      if (!isRoleName(role.name)) {
        throw new Error(`Role ${role.id} has an unsupported name.`);
      }

      user.failed_login_attempts = 0;
      user.locked_until = null;
      await user.save({ transaction });

      const payload: AuthTokenPayload = {
        id: user.id,
        role: role.name,
        is_author: user.is_author,
        specialtyId: user.specialtyId,
        email: user.email,
      };
      const authUser = toAuthUser(user, role.name);

      return {
        kind: 'success',
        data: {
          token: signToken(payload),
          user: authUser,
        },
      };
    });

    if (result.kind === 'blocked') {
      throw new AuthError(403, 'Cuenta inactiva o bloqueada. Contacte al Administrador');
    }
    if (result.kind === 'invalid') {
      throw new AuthError(401, 'Correo o contraseña incorrectos');
    }

    return result.data;
  }

  async getCurrentUser(id: number): Promise<AuthUser> {
    const user = await Usuario.findByPk(id);
    if (!user) {
      throw new AuthError(401, 'Sesión expirada. Inicie sesión nuevamente');
    }

    const role = await Rol.findByPk(user.roleId);

    if (!role) {
      throw new Error(`Role ${user.roleId} was not found for user ${user.id}.`);
    }

    return toAuthUser(user, role.name);
  }

  async updateProfile(id: number, input: UpdateProfileData): Promise<AuthUser> {
    const user = await Usuario.findByPk(id);
    if (!user) {
      throw new AuthError(404, 'Usuario no encontrado');
    }

    if (input.username !== undefined && input.username !== user.username) {
      const duplicate = await Usuario.findOne({
        where: {
          username: input.username,
          id: { [Op.ne]: id },
        },
      });
      if (duplicate) {
        throw new AuthError(409, 'El nombre de usuario ya está registrado');
      }
      user.username = input.username;
    }

    if (input.first_name !== undefined) user.first_name = input.first_name;
    if (input.last_name !== undefined) user.last_name = input.last_name;
    if (input.profile_image !== undefined) user.profile_image = input.profile_image;
    if (input.specialtyId !== undefined) {
      if (input.specialtyId !== null) {
        const specialty = await Especialidad.findByPk(input.specialtyId);
        if (!specialty || !specialty.active) {
          throw new AuthError(400, 'La especialidad seleccionada no existe o está inactiva');
        }
      }
      user.specialtyId = input.specialtyId;
    }

    await user.save();
    return this.getCurrentUser(id);
  }

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const result = await sequelize.transaction<'updated' | 'invalid' | 'blocked'>(
      async (transaction) => {
        const user = await Usuario.findByPk(id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!user) {
          return 'invalid';
        }

        if (!user.active || (user.locked_until && user.locked_until.getTime() > Date.now())) {
          return 'blocked';
        }

        const passwordIsValid = await bcrypt.compare(currentPassword, user.password);
        if (!passwordIsValid) {
          return 'invalid';
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.must_change_password = false;
        user.failed_login_attempts = 0;
        user.locked_until = null;
        await user.save({ transaction });
        return 'updated';
      },
    );

    if (result === 'blocked') {
      throw new AuthError(403, 'Cuenta inactiva o bloqueada. Contacte al Administrador');
    }
    if (result === 'invalid') {
      throw new AuthError(401, 'Correo o contraseña incorrectos');
    }
  }
}
