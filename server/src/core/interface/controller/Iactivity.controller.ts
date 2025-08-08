import { Request, Response } from "express";

export interface IActivityController {
    logActivity(req: Request, res: Response):Promise<void>;
    getActivities(req: Request, res: Response):Promise<void>;
    getBulkActivities(req: Request, res: Response):Promise<void>;
}