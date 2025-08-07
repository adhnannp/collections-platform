import jwt from 'jsonwebtoken';
import { UserRole } from '../models/user.model';
import redisClient from '../config/redis';
import { IAuthService } from '../core/interface/service/Iauth.service';
import { HttpError } from '../utils/http.error';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { MESSAGES } from '../utils/Response.messages';
import { IUserRepository } from '../core/interface/repository/Iuser.repository';
import { TYPES } from '../di/types';
import { inject, injectable } from 'inversify';
import { toUserDTO, UserDTO } from '../core/dto/user.dto';

const JWT_SECRET = process.env.JWT_SECRET!;

@injectable()
export class AuthService implements IAuthService {
  
  private REDIS_CONST = 'session';

  constructor(@inject(TYPES.UserRepository) private _userRepo: IUserRepository) 
  {}

  async register(email: string, password: string, role: UserRole): Promise<UserDTO> {
    const existingUser = await this._userRepo.findOne({ email });
    if (existingUser) throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.USER_EXISTS);
    const user = await this._userRepo.create({ email, password, role });
    return toUserDTO(user);
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this._userRepo.findOne({ email });
    if (!user) throw new HttpError(STATUS_CODES.UNAUTHORIZED, MESSAGES.USER_NOT_FOUND);
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      throw new HttpError(STATUS_CODES.FORBIDDEN, MESSAGES.ACCOUNT_LOCKED);
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.lockedUntil = Date.now() + 30 * 60 * 1000;
      }
      await this._userRepo.save(user);
      throw new HttpError(STATUS_CODES.UNAUTHORIZED,MESSAGES.INVALID_CREADENTIALS);
    }

    user.failedAttempts = 0;
    user.lockedUntil = null;
    await this._userRepo.save(user);

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    await redisClient.setEx(`${this.REDIS_CONST}:${user._id}`, 3600, token);
    return token;
  }

  async verifyToken(token: string): Promise<UserDTO> {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const session = await redisClient.get(`${this.REDIS_CONST}:${decoded.id}`);
    if (session !== token) throw new HttpError(STATUS_CODES.UNAUTHORIZED, MESSAGES.INVALID_SESSION);

    const user = await this._userRepo.findById(decoded.id);
    if (!user) throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.USER_NOT_FOUND);
    return toUserDTO(user);
  }
}