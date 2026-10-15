import type { Request, Response } from 'express';

export class EditorialController {
  list(_req: Request, res: Response) {
    res.json({ success: true, data: [] });
  }
}
