import { Request, Response } from 'express';

export interface IAccountController {
  listAccounts(req: Request, res: Response): Promise<void>;
  createAccount(req: Request, res: Response): Promise<void>;
  getAccount(req: Request, res: Response): Promise<void>;
  updateAccount(req: Request, res: Response): Promise<void>;
  deleteAccount(req: Request, res: Response): Promise<void>;
  bulkUpdate(req: Request, res: Response): Promise<void>;
  advancedSearch(req: Request, res: Response): Promise<void>;
}
