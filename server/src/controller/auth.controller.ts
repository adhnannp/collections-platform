import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../validation/auth.schema';
import { treeifyError } from 'zod';
import { IAuthController } from '../core/interface/controller/Iauth.controller';
import { TYPES } from '../di/types';
import { IAuthService } from '../core/interface/service/Iauth.service';
import { inject, injectable } from 'inversify';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { MESSAGES } from '../utils/Response.messages';

@injectable()
export class AuthController implements IAuthController{
  constructor(@inject(TYPES.AuthService) private _authServ:IAuthService)
  {}

  async register(req: Request, res: Response):Promise<void> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsed.error) });
      return;
    }
    const {email,password,role} = parsed.data
    const user = await this._authServ.register(email, password, role);
    res.status(STATUS_CODES.CREATED).json(user);
  }

  async login(req: Request, res: Response) : Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsed.error) });
      return;
    }
    const {email,password} = parsed.data
    const { accessToken, refreshToken } = await this._authServ.login(email,password);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(STATUS_CODES.OK).json({ accessToken });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.NO_REFRESH_TOKEN_PROVIDED });
      return;
    }

    try {
      const { newAccessToken, newRefreshToken } = await this._authServ.refreshAccessToken(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(STATUS_CODES.OK).json({ accessToken: newAccessToken });
      return;
    } catch (error) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.INVALID_REFRESH_TOKEN });
      return;
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    const userId = req.user?._id;
    if (!userId) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({ message:MESSAGES.USER_NOT_FOUND });
      return;
    }
    await this._authServ.logout(userId);
      res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.LOG_OUT });
    return;
  }

}
