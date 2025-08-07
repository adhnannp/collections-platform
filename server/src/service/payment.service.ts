import { Payment, IPayment } from '../models/payment.model';
import redisClient from '../config/redis';

export class PaymentService {
  static async recordPayment(accountId: string, data: Partial<IPayment>): Promise<IPayment> {
    const payment = new Payment({ ...data, accountId });
    await payment.save();

    await redisClient.del(`payments:${accountId}`);
    return payment;
  }

  static async getPayments(accountId: string, page: number = 1, limit: number = 10): Promise<IPayment[]> {
    const cacheKey = `payments:${accountId}:${page}:${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const payments = await Payment.find({ accountId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    await redisClient.setEx(cacheKey, 300, JSON.stringify(payments));
    return payments;
  }

  static async updatePaymentStatus(paymentId: string, status: 'pending' | 'completed' | 'failed'): Promise<IPayment> {
    const payment = await Payment.findByIdAndUpdate(paymentId, { status }, { new: true });
    if (!payment) throw new Error('Payment not found');

    await redisClient.del(`payments:${payment.accountId}`);
    return payment;
  }
}