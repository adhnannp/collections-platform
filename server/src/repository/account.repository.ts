import { BaseRepository } from './base.repository';
import { injectable } from 'inversify';
import { Account, IAccount } from '../models/account.model';
import { IAccountRepository } from '../core/interface/repository/iaccount.repository';

@injectable()
export class AccountRepository extends BaseRepository<IAccount> implements IAccountRepository {
  constructor() {
    super(Account);
  }
}