import { inject, injectable } from 'inversify';
import { IPayment, paymentStatus } from '../models/payment.model';
import { IPaymentRepository } from '../core/interface/repository/Ipayment.repository';
import { IPaymentService } from '../core/interface/service/Ipayment.service';
import { TYPES } from '../di/types';
import redisClient from '../config/redis';
import { HttpError } from '../utils/http.error';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { MESSAGES } from '../utils/Response.messages';
import { toPaymentDto, PaymentDto } from '../core/dto/payment.dto';

@injectable()
export class PaymentService implements IPaymentService {
  private REDIS_CONST = 'payments';
  constructor(
    @inject(TYPES.PaymentRepository) private _paymentRepo: IPaymentRepository
  ) {}

  async recordPayment(accountId: string, data: Partial<IPayment>): Promise<PaymentDto> {
    const payment = await this._paymentRepo.recordPayment(accountId, data);
    if(!payment){
      throw new HttpError(STATUS_CODES.BAD_REQUEST,MESSAGES.PAYMENTS_RECORD_FAILED)
    }
    await redisClient.del(`${this.REDIS_CONST}:${accountId}`);
    return toPaymentDto(payment);
  }

  async getPayments(accountId: string, page: number = 1, limit: number = 10): Promise<PaymentDto[]> {
    const cacheKey = `${this.REDIS_CONST}:${accountId}:${page}:${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const payments = await this._paymentRepo.getPayments(accountId, page, limit);
    if(!payments){
      throw new HttpError(STATUS_CODES.BAD_REQUEST,MESSAGES.PAYMENTS_NOT_FOUND)
    }
    const paymentDtos = payments.map(toPaymentDto);
    await redisClient.setEx(cacheKey, 300, JSON.stringify(paymentDtos));
    return paymentDtos;
  }

  async updatePaymentStatus(paymentId: string, status: paymentStatus): Promise<PaymentDto> {
    const updated = await this._paymentRepo.updatePaymentStatus(paymentId, status);
    if(!updated){
      throw new HttpError(STATUS_CODES.BAD_REQUEST,MESSAGES.PAYMENTS_STATUS_UPDATE_FAILED)
    }
    await redisClient.del(`${this.REDIS_CONST}:${updated.accountId}`);
    return toPaymentDto(updated);
  }
}
