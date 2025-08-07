import { Account, IAccount } from '../models/account.model';
import redisClient from '../config/redis';
import { AnyBulkWriteOperation } from 'mongoose';

export class AccountService {
  static async listAccounts({ page, limit, sort, filters }: any) {
    const cacheKey = `accounts:${page}:${limit}:${sort}:${JSON.stringify(filters)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const query = { deletedAt: null, ...filters };
    const accounts = await Account.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    await redisClient.setEx(cacheKey, 300, JSON.stringify(accounts));
    return accounts;
  }

  static async createAccount(data: Partial<IAccount>, user: any): Promise<IAccount> {
    const account = new Account({ ...data, userId: user._id });
    await account.save();
    return account;
  }

  static async getAccount(id: string): Promise<IAccount> {
    const cacheKey = `account:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const account = await Account.findOne({ _id: id, deletedAt: null }).lean();
    if (!account) throw new Error('Account not found');

    await redisClient.setEx(cacheKey, 300, JSON.stringify(account));
    return account;
  }

  static async bulkUpdate(updates: { id: string; data: Partial<IAccount> }[]): Promise<{ updated: number; errors: any[] }> {
    const operations: AnyBulkWriteOperation<IAccount>[] = updates.map(({ id, data }) => ({
      updateOne: {
        filter: { _id: id, deletedAt: null },
        update: { $set: data },
      },
    }));

    try {
      const result = await Account.bulkWrite(operations, { ordered: false });
      
      const accountIds = updates.map(update => update.id);
      for (const id of accountIds) {
        await redisClient.del(`account:${id}`);
        await redisClient.del(`payments:${id}`);
        await redisClient.del(`activities:${id}`);
      }
      await redisClient.del(`accounts:*`);

      return {
        updated: result.modifiedCount,
        errors: [],
      };
    } catch (error:any) {
      return {
        updated: 0,
        errors: error.writeResult?.result?.writeErrors || [error],
      };
    }
  }

  static async advancedSearch({ query, dateRange, geo, customFields, page = 1, limit = 10 }: any) {
    const pipeline: any[] = [
      { $match: { deletedAt: null } },
    ];
    if (query) {
      pipeline.push({ $match: { $text: { $search: query } } });
    }
    if (dateRange?.start && dateRange?.end) {
      pipeline.push({
        $match: {
          createdAt: {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
          },
        },
      });
    }

    if (geo?.lat && geo?.lng && geo?.radius) {
      pipeline.push({
        $match: {
          location: {
            $geoWithin: {
              $centerSphere: [[geo.lng, geo.lat], geo.radius / 6378.1],
            },
          },
        },
      });
    }

    if (customFields) {
      pipeline.push({ $match: customFields });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    const cacheKey = `search:${JSON.stringify({ query, dateRange, geo, customFields, page, limit })}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const accounts = await Account.aggregate(pipeline);
    await redisClient.setEx(cacheKey, 300, JSON.stringify(accounts));
    return accounts;
  }

}