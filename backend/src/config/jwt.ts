import 'dotenv/config';
import jwt, { type JwtPayload, type Secret } from 'jsonwebtoken';
import { isRoleName, type RoleName } from '../modules/auth/auth.dto.js';

export const JWT_EXPIRES_IN = '8h';

export interface AuthTokenPayload {
  id: number;
  role: RoleName;
  specialtyId: number | null;
  email: string;
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

const getJwtSecret = (): Secret => jwtSecret;

export const signToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });

export const verifyToken = (token: string): AuthTokenPayload => {
  const verifiedPayload = jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
  });

  if (
    typeof verifiedPayload === 'string' ||
    !isTokenPayload(verifiedPayload)
  ) {
    throw new Error('Invalid authentication token.');
  }

  return {
    id: verifiedPayload.id,
    role: verifiedPayload.role,
    specialtyId: verifiedPayload.specialtyId,
    email: verifiedPayload.email,
  };
};

const isTokenPayload = (
  payload: JwtPayload,
): payload is JwtPayload & AuthTokenPayload =>
  typeof payload.id === 'number' &&
  Number.isInteger(payload.id) &&
  typeof payload.role === 'string' &&
  isRoleName(payload.role) &&
  (payload.specialtyId === null ||
    (typeof payload.specialtyId === 'number' && Number.isInteger(payload.specialtyId))) &&
  typeof payload.email === 'string';
