import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../validation/auth.schema';
import { treeifyError } from 'zod';
import { IAuthController } from '../core/interface/controller/Iauth.controller';
import { TYPES } from '../di/types';
import { IAuthService } from '../core/interface/service/Iauth.service';
import { inject, injectable } from 'inversify';
import { STATUS_CODES } from '../utils/http.statuscodes';

@injectable()
export class AuthController implements IAuthController{
  constructor(@inject(TYPES.AuthService) private _authServ:IAuthService)
  {}

  async register(req: Request, res: Response):Promise<void> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ errors: treeifyError(parsed.error) });
      return;
    }
    const {email,password,role} = parsed.data
    const user = await this._authServ.register(email, password, role);
    res.status(STATUS_CODES.CREATED).json(user);
  }

  async login(req: Request, res: Response) : Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ errors: treeifyError(parsed.error) });
      return;
    }
    const {email,password} = parsed.data
    const token = await this._authServ.login(email,password);
    res.status(STATUS_CODES.OK).json({ token });
  }
}
