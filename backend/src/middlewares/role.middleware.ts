import type { Request, Response, NextFunction } from 'express';

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role ?? 'USER';
    if (!roles.includes(role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    next();
  };
};
