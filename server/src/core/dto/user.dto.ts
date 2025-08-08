import { Types } from "mongoose";
import { IUser,UserRole } from "../../models/user.model";

export interface UserDTO {
  _id: string;
  email: string;
  role: UserRole;
  failedAttempts: number;
  lockedUntil: number | null;
  createdAt: Date;
  updatedAt: Date;
}


export const toUserDTO = (user: IUser): UserDTO => {
  return {
    _id: (user._id as Types.ObjectId).toString(),
    email: user.email,
    role: user.role,
    failedAttempts: user.failedAttempts,
    lockedUntil: user.lockedUntil,
    createdAt: user.createdAt!,
    updatedAt: user.updatedAt!,
  };
};
