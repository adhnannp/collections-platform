import { inject, injectable } from 'inversify';
import { ActivityDto, mapActivityToDto } from '../core/dto/activity.dto';
import { IActivityRepository } from '../core/interface/repository/Iactivity.repository';
import { IActivity } from '../models/activity.model';
import { TYPES } from '../di/types';
import { IActivityService } from '../core/interface/service/Iactivity.service';
import { IAccountRepository } from '../core/interface/repository/iaccount.repository';
import { Types } from 'mongoose';
import { HttpError } from '../utils/http.error';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { MESSAGES } from '../utils/Response.messages';
import ISocketHandler from '../core/interface/controller/Isocket.controller';
import { USER_CONST } from '../utils/const.shema';
import { redisGet, redisSet, redisDel } from '../helper/redis.helper';
import { IO } from '../helper/notification.helper';

@injectable()
export class ActivityService implements IActivityService {
  private REDIS_ACTIVITIES = 'activities';
  private REDIS_BULK_ACTIVITIES = 'bulk_activities';

  constructor(
    @inject(TYPES.ActivityRepository) private _activityRepo: IActivityRepository,
    @inject(TYPES.AccountRepository) private _accountRepo: IAccountRepository,
    @inject(TYPES.SocketController) private _socketHandle: ISocketHandler
  ) {}

  async logActivity(accountId: string, data: Partial<IActivity>, userId: string, role: string): Promise<ActivityDto> {
    const account = await this._accountRepo.findOne({ _id: accountId, userId });
    if (!account) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.ACCOUNT_NOT_FOUND);
    }
    if (role === USER_CONST.AGENT && !account) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.UN_AUTHORIZED_ACTIVITY);
    }
    const activity = await this._activityRepo.create({
      ...data,
      accountId: new Types.ObjectId(accountId),
    } as Partial<IActivity>);

    await redisDel(`${this.REDIS_ACTIVITIES}:${accountId}`);

    const notification = {
      accountName: account.name,
      message: IO.MESSAGES.ACTIVITY_LOGGED(account.name),
      timestamp: new Date(),
    };
    await this._socketHandle.emitNotification(userId, notification, true);
    return mapActivityToDto(activity);
  }

  async getActivities(accountId: string, page: number = 1, limit: number = 10): Promise<ActivityDto[]> {
    const cacheKey = `${this.REDIS_ACTIVITIES}:${accountId}:${page}:${limit}`;
    const cached = await redisGet<ActivityDto[]>(cacheKey);
    if (cached) return cached;
    const activities = await this._activityRepo.findByAccountId(accountId, page, limit);
    const mapped = activities.map(mapActivityToDto);
    await redisSet(cacheKey, mapped, 300);
    return mapped;
  }

  async getBulkActivities(accountIds: string[]): Promise<ActivityDto[]> {
    const cacheKey = `${this.REDIS_BULK_ACTIVITIES}:${accountIds.join(':')}`;
    const cached = await redisGet<ActivityDto[]>(cacheKey);
    if (cached) return cached;
    const activities = await this._activityRepo.findBulkByAccountIds(accountIds);
    const mapped = activities.map(mapActivityToDto);
    await redisSet(cacheKey, mapped, 300);
    return mapped;
  }
}