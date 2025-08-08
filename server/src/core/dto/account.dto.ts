import { Types } from 'mongoose';
import { IAccount } from '../../models/account.model';

export interface AccountResDto {
  _id: string;
  userId: string;
  name: string;
  mobileNumber: string;
  address: string;
  balance: number;
  status: 'active' | 'inactive' | 'delinquent';
  isListed: boolean;
  createdAt: string;
  updatedAt: string;
}


export const toAccountResDto = (account: IAccount): AccountResDto => {
  return {
    _id: (account._id as Types.ObjectId).toString(),
    userId: account.userId.toString(),
    name: account.name,
    mobileNumber: account.mobileNumber,
    address: account.address,
    balance: account.balance,
    status: account.status,
    isListed: account.isListed,
    createdAt: account.createdAt?.toISOString?.() ?? '',
    updatedAt: account.updatedAt?.toISOString?.() ?? '',
  };
};
