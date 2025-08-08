import { injectable } from 'inversify';
import { Activity, IActivity } from '../models/activity.model';
import { BaseRepository } from './base.repository';
import { IActivityRepository } from '../core/interface/repository/Iactivity.repository';

@injectable()
export class ActivityRepository extends BaseRepository<IActivity> implements IActivityRepository {
  constructor() {
    super(Activity);
  }

  async findByAccountId(accountId: string, page: number, limit: number): Promise<IActivity[]> {
    return Activity.find({ accountId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  async findBulkByAccountIds(accountIds: string[]): Promise<IActivity[]> {
    return Activity.find({ accountId: { $in: accountIds } })
      .sort({ createdAt: -1 })
      .lean();
  }
  
}
