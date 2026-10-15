import type { Request, Response } from 'express';

export class AiController {
  generate(req: Request, res: Response) {
    res.json({ success: true, message: 'generate', body: req.body });
  }
}
