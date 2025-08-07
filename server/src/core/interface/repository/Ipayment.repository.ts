import { IPayment, paymentStatus } from "../../../models/payment.model";
import { IBaseRepository } from "./Ibase.repository";

export interface IPaymentRepository extends IBaseRepository<IPayment>{
  recordPayment(accountId: string, data: Partial<IPayment>): Promise<IPayment>;
  getPayments(accountId: string, page?: number, limit?: number): Promise<IPayment[]>;
  updatePaymentStatus(paymentId: string, status: paymentStatus): Promise<IPayment>;
}
