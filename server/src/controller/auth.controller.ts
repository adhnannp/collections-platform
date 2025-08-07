import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;
      const user = await AuthService.register(email, password, role);
      res.status(201).json({ id: user._id, email: user.email, role: user.role });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const token = await AuthService.login(email, password);
      res.json({ token });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
}