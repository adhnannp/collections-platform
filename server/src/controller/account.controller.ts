import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { accountCreateSchema, accountQuerySchema, accountUpdateSchema, advancedSearchSchema } from '../validation/account.schema';
import { treeifyError } from 'zod';
import { MESSAGES } from '../utils/Response.messages';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { IAccountService } from '../core/interface/service/Iaccount.service';
import { IAccountController } from '../core/interface/controller/Iaccount.controller';

@injectable()
export class AccountController implements IAccountController {
  constructor(
    @inject(TYPES.AccountService) private _accountServ: IAccountService
  ) {}

  async listAccounts(req: Request, res: Response): Promise<void> {
    const parsedQuery = accountQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsedQuery.error) });
      return;
    }
    const { page, limit, sort } = parsedQuery.data;
    const role = req.user?.role;
    const userId = req.user?._id;
    if (!role || !userId) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH_ERROR });
      return;
    }
    const accounts = await this._accountServ.listAccounts({
      page,
      limit,
      sort,
      filters: req.query,
      role,
      userId,
    });
    res.status(STATUS_CODES.OK).json(accounts);
  }

  async createAccount(req: Request, res: Response): Promise<void> {
    const parsed = accountCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsed.error) });
      return;
    }
    if (!req.user || !req.user.role) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH_ERROR });
      return;
    }
    const account = await this._accountServ.createAccount(parsed.data, req.user?.role);
    res.status(STATUS_CODES.CREATED).json(account);
  }

  async getAccount(req: Request, res: Response): Promise<void> {
    const role = req.user?.role;
    if (!role) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH_ERROR });
      return;
    }
    const account = await this._accountServ.getAccount(req.params.id, role);
    if (!account) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ACCOUNT_NOT_FOUND });
      return;
    }
    res.status(STATUS_CODES.OK).json(account);
  }

  async updateAccount(req: Request, res: Response): Promise<void> {
    const parsed = accountUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(parsed.error) });
      return;
    }
    const role = req.user?.role;
    const userId = req.user?._id;
    if (!role || !userId) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH_ERROR });
      return;
    }
    const updated = await this._accountServ.updateAccount(req.params.id, parsed.data, role, userId);
    if (!updated) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ACCOUNT_NOT_FOUND_NOT_UPDATED });
      return;
    }
    res.status(STATUS_CODES.OK).json(updated);
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    const role = req.user?.role;
    const userId = req.user?._id;
    if (!role || !userId) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH_ERROR });
      return;
    }
    const deleted = await this._accountServ.deleteAccount(req.params.id, role, userId);
    if (!deleted) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ACCOUNT_NOT_FOUND });
      return;
    }
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.ACCOUNT_DELEATED });
  }

  async bulkUpdate(req: Request, res: Response): Promise<void> {
    const updates = req.body.updates;
    const role = req.user?.role;
    const userId = req.user?._id;
    if (!role || !userId) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH_ERROR });
      return;
    }
    const result = await this._accountServ.bulkUpdate(updates, role, userId);
    res.status(STATUS_CODES.OK).json(result);
  }

  async advancedSearch(req: Request, res: Response): Promise<void> {
    const role = req.user?.role;
    const userId = req.user?._id;
    const result = advancedSearchSchema.safeParse(req.body);
    if (!role || !userId) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.AUTH_ERROR });
      return;
    }
    if (!result.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: treeifyError(result.error) });
      return;
    }
    const validated = result.data;
    const accounts = await this._accountServ.advancedSearch({
      ...validated,
      role,
      userId,
    });
    res.status(STATUS_CODES.OK).json(accounts);
  }
}