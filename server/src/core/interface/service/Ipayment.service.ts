import { IPayment, paymentStatus } from '../../../models/payment.model';
import { PaymentDto } from '../../dto/payment.dto';

export interface IPaymentService {
  recordPayment(accountId: string, data: Partial<IPayment>): Promise<PaymentDto>;
  getPayments(accountId: string, page?: number, limit?: number): Promise<PaymentDto[]>;
  updatePaymentStatus(paymentId: string, status: paymentStatus): Promise<PaymentDto>;
}
