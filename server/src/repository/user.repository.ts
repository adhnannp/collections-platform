import { BaseRepository } from './base.repository';
import { User, IUser } from '../models/user.model';
import { IUserRepository } from '../core/interface/repository/Iuser.repository';

export class UserRepository extends BaseRepository<IUser> implements IUserRepository{
  constructor() {
    super(User);
  }

  async save(doc: IUser & { save: () => Promise<IUser> }): Promise<IUser> {
    return doc.save();
  }
  
}