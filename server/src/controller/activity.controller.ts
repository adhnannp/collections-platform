import { Request, Response } from 'express';
import { ActivityService } from '../service/activity.service';

export class ActivityController {
  static async logActivity(req: Request, res: Response) {
    try {
      const activity = await ActivityService.logActivity(req.params.id, req.body);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getActivities(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const activities = await ActivityService.getActivities(req.params.id, Number(page), Number(limit));
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getBulkActivities(req: Request, res: Response) {
    try {
      const { accountIds } = req.body;
      const activities = await ActivityService.getBulkActivities(accountIds);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}