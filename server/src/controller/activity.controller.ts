import { Request, Response } from 'express';
import { IActivityController } from '../core/interface/controller/Iactivity.controller';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { IActivityService } from '../core/interface/service/Iactivity.service';
import {
  logActivitySchema,
  activityParamsSchema,
  paginationQuerySchema,
  bulkActivitiesSchema,
} from '../validation/activity.schema';
import { treeifyError } from 'zod';
import { MESSAGES } from '../utils/Response.messages';
import { STATUS_CODES } from '../utils/http.statuscodes';

@injectable()
export class ActivityController implements IActivityController {
  constructor(
    @inject(TYPES.ActivityService) private _activityServ: IActivityService
  ) {}

  async logActivity(req: Request, res: Response): Promise<void> {
    const parsedParams = activityParamsSchema.safeParse(req.params);
    const parsedBody = logActivitySchema.safeParse(req.body);
    if (!parsedParams.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsedParams.error) });
      return;
    }
    if (!parsedBody.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsedBody.error) });
      return;
    }
    const userId = req.user?._id;
    const role = req.user?.role;
    if (!role || !userId) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH_ERROR });
      return;
    }
    const activity = await this._activityServ.logActivity(
      parsedParams.data.id,
      parsedBody.data,
      userId,
      role
    );
    res.status(STATUS_CODES.CREATED).json(activity);
    return;
  }

  async getActivities(req: Request, res: Response): Promise<void> {
    const parsedParams = activityParamsSchema.safeParse(req.params);
    const parsedQuery = paginationQuerySchema.safeParse(req.query);

    if (!parsedParams.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsedParams.error) });
      return;
    }

    if (!parsedQuery.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsedQuery.error) });
      return;
    }

    const { page, limit } = parsedQuery.data;
    const activities = await this._activityServ.getActivities(parsedParams.data.id, page, limit);
    res.status(STATUS_CODES.OK).json(activities);
    return;
  }

  async getBulkActivities(req: Request, res: Response): Promise<void> {
    const parsedBody = bulkActivitiesSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsedBody.error) });
      return;
    }
    const activities = await this._activityServ.getBulkActivities(parsedBody.data.accountIds);
    res.status(STATUS_CODES.OK).json(activities);
    return;
  }
}
