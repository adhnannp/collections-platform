import { IActivity } from "../../../models/activity.model";
import { IBaseRepository } from "./Ibase.repository";

export interface IActivityRepository extends IBaseRepository<IActivity>{
    findByAccountId(accountId: string, page: number, limit: number): Promise<IActivity[]>;
    findBulkByAccountIds(accountIds: string[]): Promise<IActivity[]>;
}