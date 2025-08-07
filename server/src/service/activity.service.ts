import { Activity, IActivity } from '../models/activity.model';
import redisClient from '../config/redis';

export class ActivityService {
  static async logActivity(accountId: string, data: Partial<IActivity>): Promise<IActivity> {
    const activity = new Activity({ ...data, accountId });
    await activity.save();

    await redisClient.del(`activities:${accountId}`);
    return activity;
  }

  static async getActivities(accountId: string, page: number = 1, limit: number = 10): Promise<IActivity[]> {
    const cacheKey = `activities:${accountId}:${page}:${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const activities = await Activity.find({ accountId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    await redisClient.setEx(cacheKey, 300, JSON.stringify(activities));
    return activities;
  }

  static async getBulkActivities(accountIds: string[]): Promise<IActivity[]> {
    const cacheKey = `bulk_activities:${accountIds.join(':')}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const activities = await Activity.find({ accountId: { $in: accountIds } })
      .sort({ createdAt: -1 })
      .lean();

    await redisClient.setEx(cacheKey, 300, JSON.stringify(activities));
    return activities;
  }
}