import bcrypt from 'bcryptjs';
import { signToken, type AuthTokenPayload } from '../../config/jwt.js';
import { sequelize } from '../../config/database.js';
import { Rol } from '../usuarios/Rol.model.js';
import { Usuario } from '../usuarios/Usuario.model.js';
import { isRoleName, type AuthUser, type LoginResponse } from './auth.dto.js';

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
    role: roleName,
    specialtyId: user.specialtyId,
    must_change_password: user.must_change_password,
  };
};

export class AuthService {
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
