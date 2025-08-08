import { IUser } from "../../../models/user.model";
import { IBaseRepository } from "./Ibase.repository";

export interface IUserRepository extends IBaseRepository<IUser>{
    save(doc: IUser & { save: () => Promise<IUser> }): Promise<IUser>
}