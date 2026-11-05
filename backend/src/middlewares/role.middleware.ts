import type { NextFunction, Request, Response } from 'express';
import type { RoleName } from '../modules/auth/auth.dto.js';

export const requireRole = (allowedRoles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'No tiene permisos para acceder a esta sección',
      });
      return;
    }

    next();
  };
};

export const requireAuthor = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user || (!req.user.is_author && req.user.role !== 'ADMIN')) {
    res.status(403).json({
      success: false,
      error: 'No tiene permisos para enviar publicaciones',
    });
    return;
  }

  next();
};
