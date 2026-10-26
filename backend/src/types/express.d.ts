import type { RoleName } from '../modules/auth/auth.dto.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: RoleName;
        specialtyId: number | null;
        email: string;
      };
    }
  }
}

export {};
