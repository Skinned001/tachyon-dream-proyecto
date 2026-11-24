import type { NextFunction, Request, Response } from 'express';
import type { ApiResponse } from '../auth/auth.dto.js';
import type { DashboardSummaryDTO } from './dashboard.dto.js';
import { DashboardService } from './dashboard.service.js';

export class DashboardController {
  constructor(private readonly service = new DashboardService()) {}

  summary = async (
    req: Request,
    res: Response<ApiResponse<DashboardSummaryDTO>>,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Sesión expirada. Inicie sesión nuevamente.',
      });
      return;
    }

    try {
      const data = await this.service.getSummary(req.user);
      res.status(200).json({ success: true, data });
    } catch (error: unknown) {
      next(error);
    }
  };
}
