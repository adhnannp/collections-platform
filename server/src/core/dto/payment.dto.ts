import { Types } from "mongoose";
import { IPayment, paymentStatus } from "../../models/payment.model";

export interface PaymentDto {
  _id: string;
  accountId: string;
  amount: number;
  status: paymentStatus;
  createdAt: string;
  updatedAt: string;
}


export const toPaymentDto = (payment: IPayment): PaymentDto => ({
  _id: (payment._id as Types.ObjectId).toString(),
  accountId: payment.accountId.toString(),
  amount: payment.amount,
  status: payment.status,
  createdAt: payment.createdAt.toISOString(),
  updatedAt: payment.updatedAt.toISOString(),
});
