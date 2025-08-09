import { inject, injectable } from 'inversify';
import { UserRole } from '../models/user.model';
import { IAuthService } from '../core/interface/service/Iauth.service';
import { HttpError } from '../utils/http.error';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { MESSAGES } from '../utils/Response.messages';
import { IUserRepository } from '../core/interface/repository/Iuser.repository';
import { TYPES } from '../di/types';
import { toUserDTO, UserDTO } from '../core/dto/user.dto';
import { signAccessToken, signRefreshToken, verifyToken } from '../helper/jwt.helper';
import { redisGet, redisSet, redisDel } from '../helper/redis.helper';

@injectable()
export class AuthService implements IAuthService {
  private REDIS_ACCESS = 'access';
  private REDIS_REFRESH = 'refresh';

  constructor(@inject(TYPES.UserRepository) private _userRepo: IUserRepository) {}

  async register(email: string, password: string, role: UserRole): Promise<UserDTO> {
    const existingUser = await this._userRepo.findOne({ email });
    if (existingUser) throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.USER_EXISTS);
    const user = await this._userRepo.create({ email, password, role });
    return toUserDTO(user);
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
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
      throw new HttpError(STATUS_CODES.UNAUTHORIZED, MESSAGES.INVALID_CREADENTIALS);
    }
    user.failedAttempts = 0;
    user.lockedUntil = null;

    await this._userRepo.save(user);

    const payload = { id: user._id as string, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await redisSet(`${this.REDIS_ACCESS}:${user._id}`, accessToken, 60 * 60);
    await redisSet(`${this.REDIS_REFRESH}:${user._id}`, refreshToken, 7 * 24 * 60 * 60);

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string): Promise<UserDTO> {
    const decoded = verifyToken(token);
    const session = await redisGet<string>(`${this.REDIS_ACCESS}:${decoded.id}`);
    if (session !== token) throw new HttpError(STATUS_CODES.UNAUTHORIZED, MESSAGES.INVALID_SESSION);

    const user = await this._userRepo.findById(decoded.id);
    if (!user) throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.USER_NOT_FOUND);
    return toUserDTO(user);
  }

  async refreshAccessToken(refreshToken: string): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    try {
      const decoded = verifyToken(refreshToken);
      const stored = await redisGet<string>(`${this.REDIS_REFRESH}:${decoded.id}`);
      if (stored !== refreshToken) {
        throw new HttpError(STATUS_CODES.UNAUTHORIZED, MESSAGES.INVALID_SESSION);
      }

      const user = await this._userRepo.findById(decoded.id);
      if (!user) throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.USER_NOT_FOUND);

      const newAccessToken = signAccessToken({ id: user._id as string, role: user.role });
      const newRefreshToken = signRefreshToken({ id: user._id as string, role: user.role });

      await redisSet(`${this.REDIS_ACCESS}:${user._id}`, newAccessToken, 60 * 60);
      await redisSet(`${this.REDIS_REFRESH}:${user._id}`, newRefreshToken, 7 * 24 * 60 * 60);

      return { newAccessToken, newRefreshToken };
    } catch (err) {
      throw new HttpError(STATUS_CODES.UNAUTHORIZED, MESSAGES.INVALID_TOKEN);
    }
  }

  async logout(userId: string): Promise<void> {
    await redisDel(`${this.REDIS_ACCESS}:${userId}`, `${this.REDIS_REFRESH}:${userId}`);
  }
}