import { BulkWriteResult } from "mongodb";
import { IAccount } from "../../../models/account.model";
import { UserRole } from "../../../models/user.model";
import { AdvancedSearchDto, ListReqDto } from "../../dto/req/account.list.req";
import { IBaseRepository } from "./Ibase.repository";

export interface IAccountRepository extends IBaseRepository<IAccount>{
    listAccounts({ page, limit, sort, filters, role, userId }:ListReqDto):Promise<IAccount[]>;
    getAccount( id:string, role:UserRole):Promise<IAccount | null>;
    updateAccount(id:string,data:Partial<IAccount>):Promise<IAccount|null>;
    deleteAccount(id:string): Promise<IAccount | null>;
    bulkUpdate(operations: any[]):Promise<BulkWriteResult>;
    advancedSearch({query,dateRange,customFields,page,limit,role,userId,}: AdvancedSearchDto):Promise<IAccount[]>;
}