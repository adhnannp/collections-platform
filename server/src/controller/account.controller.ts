import { Request, Response } from 'express';
import { AccountService } from '../service/account.service';

export class AccountController {
  static async listAccounts(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', ...filters } = req.query;
      const accounts = await AccountService.listAccounts({
        page: Number(page),
        limit: Number(limit),
        sort: String(sort),
        filters,
      });
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async createAccount(req: Request, res: Response) {
    try {
      const account = await AccountService.createAccount(req.body, req.user);
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getAccount(req: Request, res: Response) {
    try {
      const account = await AccountService.getAccount(req.params.id);
      res.json(account);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  static async updateAccount(req: Request, res: Response) {
    try {
      const account = await AccountService.getAccount(req.params.id);
      res.json(account);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const account = await AccountService.getAccount(req.params.id);
      res.json(account);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  static async bulkUpdate(req: Request, res: Response) {
    try {
      const updates = req.body.updates; // Array of { id, data }
      const result = await AccountService.bulkUpdate(updates);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async advancedSearch(req: Request, res: Response) {
    try {
      const { query, dateRange, geo, customFields, page = 1, limit = 10 } = req.body;
      const accounts = await AccountService.advancedSearch({ query, dateRange, geo, customFields, page, limit });
      res.json(accounts);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

}