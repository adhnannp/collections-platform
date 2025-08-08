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
import { IAccountRepository } from '../core/interface/repository/iaccount.repository';
import ISocketHandler from '../core/interface/controller/Isocket.controller';

@injectable()
export class PaymentService implements IPaymentService {
  private REDIS_CONST = 'payments';
  constructor(
    @inject(TYPES.PaymentRepository) private _paymentRepo: IPaymentRepository,
    @inject(TYPES.AccountRepository) private _accountRepo: IAccountRepository,
    @inject(TYPES.SocketController) private _socketHandle: ISocketHandler
  ) {}

  async recordPayment(accountId: string, data: Partial<IPayment>): Promise<PaymentDto> {
    const account = await this._accountRepo.findById(accountId);
    if(!account){
      throw new HttpError(STATUS_CODES.BAD_REQUEST,MESSAGES.ACCOUNT_NOT_FOUND)
    }
    const payment = await this._paymentRepo.recordPayment(accountId, data);
    if(!payment){
      throw new HttpError(STATUS_CODES.BAD_REQUEST,MESSAGES.PAYMENTS_RECORD_FAILED)
    }
    if (payment.status === 'completed') {
      const balance = account.balance+payment.amount;
      await this._accountRepo.updateById(accountId,{balance});
    }
    await redisClient.del(`${this.REDIS_CONST}:${accountId}`);
    const notification = {
      accountName: account.name,
      message: `New payment recorded: ₹${payment.amount}`,
      timestamp: new Date(),
    };

    this._socketHandle.emitNotification(account.userId.toString(), notification, true);
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

  async updatePaymentStatus(paymentId: string, newStatus: paymentStatus): Promise<PaymentDto> {
    const existing = await this._paymentRepo.findById(paymentId);
    if (!existing) {
      throw new HttpError(STATUS_CODES.NOT_FOUND, MESSAGES.PAYMENT_NOT_FOUND);
    }

    const currentStatus = existing.status;

    if (
      (currentStatus === 'completed') ||
      (currentStatus === 'failed')
    ) {
      throw new HttpError(
        STATUS_CODES.BAD_REQUEST,
        `Cannot update payment status from ${currentStatus} to ${newStatus}`
      );
    }

    const updated = await this._paymentRepo.updatePaymentStatus(paymentId, newStatus);
    const account = await this._accountRepo.findById(updated.accountId.toString());
    if (!updated) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.PAYMENTS_STATUS_UPDATE_FAILED);
    }
    if(!account){
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.ACCOUNT_NOT_FOUND);
    }
    if (newStatus === 'completed') {
      const balance = account.balance+updated.amount
      await this._accountRepo.updateById(updated.accountId.toString(),{balance});
    }
    if (account) {
      const notification = {
        accountName: account.name,
        message: `Payment status changed: ${newStatus}`,
        timestamp: new Date(),
      };
      this._socketHandle.emitNotification(account.userId.toString(), notification, true);
    }
    await redisClient.del(`${this.REDIS_CONST}:${updated.accountId}`);
    return toPaymentDto(updated);
  }

}
