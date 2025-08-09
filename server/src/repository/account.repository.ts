import { FilterQuery, SortOrder } from 'mongoose';
import { injectable } from 'inversify';
import { Account, IAccount } from '../models/account.model';
import { IAccountRepository } from '../core/interface/repository/iaccount.repository';
import { BaseRepository } from './base.repository';
import { UserRole } from '../models/user.model';
import { AdvancedSearchDto, ListReqDto } from '../core/dto/req/account.list.req';
import { BulkWriteResult } from 'mongodb'; 

@injectable()
export class AccountRepository extends BaseRepository<IAccount> implements IAccountRepository {
  constructor() {
    super(Account);
  }

  async listAccounts({ page, limit, sort, filters, role, userId }: ListReqDto):Promise<IAccount[]> {
    let query: FilterQuery<IAccount>;
    if (role === 'Viewer') {
      query = { isListed:true, ...filters };
    } else if (role === 'Agent') {
      query = {userId, ...filters };
    } else {
      query = {...filters };
    }
    return Account.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }  

  async getAccount( id:string, role:UserRole):Promise<IAccount | null> {
    const query = role === 'Viewer' ? { _id: id, isListed: true } : { _id: id };
    return Account.findOne(query).lean();
  }

  async updateAccount(id:string,data:Partial<IAccount>):Promise<IAccount|null> {
    const query = { _id: id };
    return Account.findOneAndUpdate(query,{ $set: data },{ new: true }).lean();
  }

  async deleteAccount(id:string): Promise<IAccount | null> {
    return await this.updateById(id,{isListed:false})
  }

  async bulkUpdate(operations: any[]):Promise<BulkWriteResult> {
    return Account.bulkWrite(operations, { ordered: false });
  }

  async advancedSearch({
    query,
    dateRange,
    customFields,
    page = 1,
    limit = 10,
    role,
    userId,
  }: AdvancedSearchDto) {
    const pipeline: any[] = [];

    if (query) {
      pipeline.push({ $match: { $text: { $search: query } } });
    }
    if (role === 'Admin' || role === 'Manager') {
      pipeline.push({ $match: {} }); 
    } else if (role === 'Agent') {
      pipeline.push({ $match: { userId } }); 
    } else {
      pipeline.push({ $match: { isListed: true } });
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
    if (customFields) {
      pipeline.push({ $match: customFields });
    }
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    return Account.aggregate(pipeline);
  }
}