import { IPayment, paymentStatus } from "../../../models/payment.model";

export interface IPaymentRepository {
  recordPayment(accountId: string, data: Partial<IPayment>): Promise<IPayment>;
  getPayments(accountId: string, page?: number, limit?: number): Promise<IPayment[]>;
  updatePaymentStatus(paymentId: string, status: paymentStatus): Promise<IPayment>;
}
