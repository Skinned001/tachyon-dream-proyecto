import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../modules/auth/auth.dto.js';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

const isErrorWithStatusCode = (error: unknown): error is ErrorWithStatusCode =>
  error instanceof Error &&
  'statusCode' in error &&
  typeof error.statusCode === 'number';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message
  ) {
    return error.message;
  }
  return 'Error interno del servidor';
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const message = getErrorMessage(err);
  const statusCode = isErrorWithStatusCode(err) ? err.statusCode : undefined;
  const status = statusCode && statusCode >= 400 && statusCode <= 599 ? statusCode : 500;

  res.status(status).json({ success: false, error: message });
};
