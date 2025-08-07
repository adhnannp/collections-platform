import { BaseRepository } from './base.repository';
import { injectable } from 'inversify';
import { Activity, IActivity } from '../models/activity.model';
import { IActivityRepository } from '../core/interface/repository/Iactivity.repository';

@injectable()
export class ActivityRepository extends BaseRepository<IActivity> implements IActivityRepository {
  constructor() {
    super(Activity);
  }
}