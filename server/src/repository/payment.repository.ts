import { IPayment, paymentStatus } from '../models/payment.model';
import { BaseRepository } from './base.repository';
import { Payment } from '../models/payment.model';
import { IPaymentRepository } from '../core/interface/repository/Ipayment.repository';
import { HttpError } from '../utils/http.error';
import { STATUS_CODES } from '../utils/http.statuscodes';

export class PaymentRepository extends BaseRepository<IPayment> implements IPaymentRepository {
  constructor() {
    super(Payment);
  }

  async recordPayment(accountId: string, data: Partial<IPayment>): Promise<IPayment> {
    const payment = new Payment({ ...data, accountId });
    return await payment.save();
  }

  async getPayments(accountId: string, page: number = 1, limit: number = 10): Promise<IPayment[]> {
    return await Payment.find({ accountId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  async updatePaymentStatus(paymentId: string, status: paymentStatus): Promise<IPayment> {
    const payment = await Payment.findByIdAndUpdate(paymentId, { status }, { new: true });
    if (!payment) throw new HttpError(STATUS_CODES.BAD_REQUEST,'Payment not found');
    return payment;
  }
}
