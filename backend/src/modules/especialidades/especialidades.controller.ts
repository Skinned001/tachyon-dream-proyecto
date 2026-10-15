import type { Request, Response } from 'express';

export class EspecialidadesController {
  list(_req: Request, res: Response) {
    res.json({ success: true, data: [] });
  }
}
