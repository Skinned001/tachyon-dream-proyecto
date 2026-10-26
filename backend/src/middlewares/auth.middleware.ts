import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../config/jwt.js';
import { isRoleName } from '../modules/auth/auth.dto.js';
import { Rol } from '../modules/usuarios/Rol.model.js';
import { Usuario } from '../modules/usuarios/Usuario.model.js';

const UNAUTHORIZED_RESPONSE = {
  success: false,
  error: 'Sesión expirada. Inicie sesión nuevamente',
} as const;

const FORBIDDEN_RESPONSE = {
  success: false,
  error: 'Cuenta inactiva o bloqueada. Contacte al Administrador',
} as const;

const getTokenFromRequest = (req: Request): string | undefined => {
  const authorization = req.get('authorization');
  if (authorization !== undefined) {
    const match = /^Bearer\s+(\S+)$/i.exec(authorization);
    return match?.[1];
  }

  const tokenCookie = req.headers.cookie
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('token='));

  if (!tokenCookie) {
    return undefined;
  }

  try {
    return decodeURIComponent(tokenCookie.slice('token='.length));
  } catch {
    return undefined;
  }
};

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = getTokenFromRequest(req);
  if (!token) {
    res.status(401).json(UNAUTHORIZED_RESPONSE);
    return;
  }

  let tokenPayload;
  try {
    tokenPayload = verifyToken(token);
  } catch {
    res.status(401).json(UNAUTHORIZED_RESPONSE);
    return;
  }

  try {
    const user = await Usuario.findByPk(tokenPayload.id);
    if (!user) {
      res.status(401).json(UNAUTHORIZED_RESPONSE);
      return;
    }

    if (!user.active || (user.locked_until && user.locked_until.getTime() > Date.now())) {
      res.status(403).json(FORBIDDEN_RESPONSE);
      return;
    }

    const role = await Rol.findByPk(user.roleId);
    if (!role || !isRoleName(role.name)) {
      res.status(401).json(UNAUTHORIZED_RESPONSE);
      return;
    }

    req.user = {
      id: user.id,
      role: role.name,
      specialtyId: user.specialtyId,
      email: user.email,
    };
    next();
  } catch (error: unknown) {
    next(error);
  }
};
