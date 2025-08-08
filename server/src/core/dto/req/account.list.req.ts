import { FilterQuery, SortOrder } from "mongoose";
import { IAccount } from "../../../models/account.model";
import { UserRole } from "../../../models/user.model";

export interface AdvancedSearchDto {
  query?: string;
  dateRange?: { start: string; end: string };
  customFields?: FilterQuery<IAccount>;
  page?: number;
  limit?: number;
  role: UserRole;
  userId: string;
}

export interface ListReqDto {
  page: number;
  limit: number;
  sort: { [key in keyof Partial<IAccount>]: SortOrder } | string;
  filters: FilterQuery<IAccount>;
  role: UserRole;
  userId: string;
}