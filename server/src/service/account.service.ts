import { inject, injectable } from 'inversify';
import { AnyBulkWriteOperation, FilterQuery } from 'mongoose';
import { IAccountService } from '../core/interface/service/Iaccount.service';
import { IAccountRepository } from '../core/interface/repository/iaccount.repository';
import { IAccount } from '../models/account.model';
import { TYPES } from '../di/types';
import { AdvancedSearchDto, ListReqDto } from '../core/dto/req/account.list.req';
import { UserRole } from '../models/user.model';
import { HttpError } from '../utils/http.error';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { MESSAGES } from '../utils/Response.messages';
import { toAccountResDto, AccountResDto } from '../core/dto/account.dto';
import ISocketHandler from '../core/interface/controller/Isocket.controller';
import { USER_CONST } from '../utils/const.shema';
import { redisGet, redisSet, redisDel } from '../helper/redis.helper';
import { IO } from '../helper/notification.helper';
import { Types } from 'mongoose';

@injectable()
export class AccountService implements IAccountService {
  private REDIS_ACCOUNT = 'account';
  private REDIS_ACCOUNTS = 'accounts';
  private REDIS_SEARCH = 'search';
  private REDIS_ACTIVITIES = 'activities';
  private REDIS_PAYMENTS = 'payments';

  constructor(
    @inject(TYPES.AccountRepository) private _accountRepo: IAccountRepository,
    @inject(TYPES.SocketController) private _socketHandle: ISocketHandler
  ) {}

  async listAccounts({ page, limit, sort, filters, role, userId }: ListReqDto): Promise<AccountResDto[]> {
    const cacheKey = `${this.REDIS_ACCOUNTS}:${page}:${limit}:${JSON.stringify(sort)}:${JSON.stringify(filters)}:${role}:${userId}`;
    const cached = await redisGet<AccountResDto[]>(cacheKey);
    if (cached) return cached;
    const accounts = await this._accountRepo.listAccounts({
      page,
      limit,
      sort,
      filters,
      role,
      userId,
    });
    const result = accounts.map(toAccountResDto);
    await redisSet(cacheKey, result, 300);
    return result;
  }

  async createAccount(data: Partial<IAccount>, userId: string): Promise<AccountResDto> {
    const id = new Types.ObjectId(userId);
    const account = await this._accountRepo.create({ ...data, userId: id });
    const notification = {
      accountName: account.name,
      message: IO.MESSAGES.ACCOUNT_CREATED(),
      timestamp: new Date(),
    };
    await this._socketHandle.emitNotification(account.userId.toString(), notification, true);
    return toAccountResDto(account);
  }

  async getAccount(id: string, role: UserRole): Promise<AccountResDto> {
    const cacheKey = `${this.REDIS_ACCOUNT}:${id}:${role}`;
    const cached = await redisGet<AccountResDto>(cacheKey);
    if (cached) return cached;
    const account = await this._accountRepo.getAccount(id, role);
    if (!account) throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.ACCOUNT_NOT_FOUND);
    const result = toAccountResDto(account);
    await redisSet(cacheKey, result, 300);
    return result;
  }

  async updateAccount(id: string, data: Partial<IAccount>, role: UserRole, userId: string): Promise<AccountResDto> {
    const checkAccount = await this._accountRepo.findOne({ _id: id, userId });
    if (role === USER_CONST.AGENT && !checkAccount) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.ACCESS_DENIED);
    }
    const account = await this._accountRepo.updateAccount(id, data);
    if (!account) throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.ACCOUNT_NOT_FOUND);
    await this.invalidateCaches(id);
    return toAccountResDto(account);
  }

  async deleteAccount(id: string, role: UserRole, userId: string): Promise<AccountResDto> {
    const account = await this._accountRepo.deleteAccount(id);
    if (!account) throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.ACCOUNT_NOT_FOUND);
    await this.invalidateCaches(id);
    return toAccountResDto(account);
  }

  async bulkUpdate(
    updates: { id: string; data: Partial<IAccount> }[],
    role: UserRole,
    userId: string
  ): Promise<{ updated: number; errors: any[] }> {
    const operations: AnyBulkWriteOperation<IAccount>[] = updates.map(({ id, data }) => {
      let filter: FilterQuery<IAccount> = { _id: id, deletedAt: null };
      if (role === USER_CONST.VIEWER) {
        filter = { ...filter, isListed: true };
      } else if (role === USER_CONST.AGENT) {
        filter = { ...filter, userId };
      }
      return {
        updateOne: {
          filter,
          update: { $set: data },
        },
      };
    });

    const result = await this._accountRepo.bulkUpdate(operations);
    if (!result) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.BULK_UPDATE_FAILED);
    }

    for (const { id } of updates) {
      await this.invalidateCaches(id);
    }

    return {
      updated: result.modifiedCount,
      errors: result.getWriteErrors ? result.getWriteErrors() : [],
    };
  }

  async advancedSearch({
    query,
    dateRange,
    customFields,
    page = 1,
    limit = 10,
    role,
    userId,
  }: AdvancedSearchDto): Promise<AccountResDto[]> {
    const cacheKey = `${this.REDIS_SEARCH}:${JSON.stringify({ query, dateRange, customFields, page, limit, role, userId })}`;
    const cached = await redisGet<AccountResDto[]>(cacheKey);
    if (cached) return cached;

    const accounts = await this._accountRepo.advancedSearch({
      query,
      dateRange,
      customFields,
      page,
      limit,
      role,
      userId,
    });

    const result = accounts.map(toAccountResDto);
    await redisSet(cacheKey, result, 300);
    return result;
  }

  private async invalidateCaches(accountId: string): Promise<void> {
    const keysToDelete: string[] = [
      `${this.REDIS_ACCOUNT}:${accountId}:*`,
      `${this.REDIS_PAYMENTS}:${accountId}`,
      `${this.REDIS_ACTIVITIES}:${accountId}`,
      `${this.REDIS_ACCOUNTS}:*`,
      `${this.REDIS_SEARCH}:*`,
    ];
    await redisDel(...keysToDelete);
  }
}