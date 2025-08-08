import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { IAuthService } from '../core/interface/service/Iauth.service';
import { UserDTO } from '../core/dto/user.dto';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { MESSAGES } from '../utils/Response.messages';
import { IAuthMiddleware } from '../core/interface/middleware/Iauth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: UserDTO;
    }
  }
}



@injectable()
export default class AuthMiddleware implements IAuthMiddleware {
  constructor(
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.NO_TOKEN_PROVIDED });
      return;
    }
    try {
      const user = await this.authService.verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.INVALID_TOKEN });
    }
  }
}

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(STATUS_CODES.FORBIDDEN).json({ message: MESSAGES.ACCESS_DENIED });
    }
    next();
  };
};