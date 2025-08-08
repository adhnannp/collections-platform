import { Types } from "mongoose";
import { IActivity } from "../../models/activity.model";

export interface ActivityDto {
  _id: string;
  accountId: string;
  type: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export const mapActivityToDto = (activity: IActivity): ActivityDto => ({
  _id: (activity._id as Types.ObjectId).toString(),  
  accountId: activity.accountId.toString(),
  type: activity.type,
  description: activity.description,
  createdAt: activity.createdAt,
  updatedAt: activity.updatedAt,
});
