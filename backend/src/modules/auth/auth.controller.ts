import type { Request, Response } from 'express';

export class AuthController {
  login(req: Request, res: Response) {
    res.json({ success: true, message: 'login', body: req.body });
  }

  register(req: Request, res: Response) {
    res.json({ success: true, message: 'register', body: req.body });
  }
}
