import { IAccount } from "../../../models/account.model";
import { UserRole } from "../../../models/user.model";
import { AccountResDto } from "../../dto/account.dto";
import { AdvancedSearchDto, ListReqDto } from "../../dto/req/account.list.req";

export interface IAccountService {
  listAccounts({ page, limit, sort, filters, role, userId }: ListReqDto) :Promise<AccountResDto[]>;
  createAccount(data:Partial<IAccount>,userId:string ):Promise<AccountResDto>;
  getAccount(id:string,role:UserRole): Promise<AccountResDto>;
  updateAccount(id:string ,data:Partial<IAccount> ,role:UserRole, userId:string): Promise<AccountResDto>;
  deleteAccount(id:string, role:UserRole, userId:string): Promise<AccountResDto>;
  bulkUpdate(updates: { id: string; data: Partial<IAccount> }[], role:UserRole, userId:String): Promise<{ updated: number; errors: any[] }>
  advancedSearch({query,dateRange,customFields,page,limit,role,userId,}: AdvancedSearchDto):Promise<AccountResDto[]>
}