import { IActivity } from "../../../models/activity.model";
import { ActivityDto } from "../../dto/activity.dto";

export interface IActivityService {
    logActivity(accountId: string, data: Partial<IActivity>, userId: string, role: string): Promise<ActivityDto> 
    getActivities(accountId: string, page:number, limit:number): Promise<ActivityDto[]>;
    getBulkActivities(accountIds: string[]): Promise<ActivityDto[]>;
}