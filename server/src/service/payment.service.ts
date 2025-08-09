import { inject, injectable } from 'inversify';
import { IPayment, paymentStatus } from '../models/payment.model';
import { IPaymentRepository } from '../core/interface/repository/Ipayment.repository';
import { IPaymentService } from '../core/interface/service/Ipayment.service';
import { TYPES } from '../di/types';
import { HttpError } from '../utils/http.error';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { MESSAGES } from '../utils/Response.messages';
import { toPaymentDto, PaymentDto } from '../core/dto/payment.dto';
import { IAccountRepository } from '../core/interface/repository/iaccount.repository';
import ISocketHandler from '../core/interface/controller/Isocket.controller';
import { PAYMENT_CONST } from '../utils/const.shema';
import { redisGet, redisSet, redisDel } from '../helper/redis.helper';
import { IO } from '../helper/notification.helper';

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
    if (!account) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.ACCOUNT_NOT_FOUND);
    }
    const payment = await this._paymentRepo.recordPayment(accountId, data);
    if (!payment) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.PAYMENTS_RECORD_FAILED);
    }
    if (payment.status === PAYMENT_CONST.COMPLEATED) {
      const balance = account.balance + payment.amount;
      await this._accountRepo.updateById(accountId,{balance});
    }
    await redisDel(`${this.REDIS_CONST}:${accountId}`);
    const notification = {
      accountName: account.name,
      message: IO.MESSAGES.PAYMENT_RECORDED(payment.amount, account.name),
      timestamp: new Date(),
    };

    await this._socketHandle.emitNotification(account.userId.toString(), notification, true);
    return toPaymentDto(payment);
  }

  async getPayments(accountId: string, page: number = 1, limit: number = 10): Promise<PaymentDto[]> {
    const cacheKey = `${this.REDIS_CONST}:${accountId}:${page}:${limit}`;
    const cached = await redisGet<PaymentDto[]>(cacheKey);
    if (cached) return cached;
    const payments = await this._paymentRepo.getPayments(accountId, page, limit);
    if (!payments) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.PAYMENTS_NOT_FOUND);
    }
    const paymentDtos = payments.map(toPaymentDto);
    await redisSet(cacheKey, paymentDtos, 300);
    return paymentDtos;
  }

  async updatePaymentStatus(paymentId: string, newStatus: paymentStatus): Promise<PaymentDto> {
    const existing = await this._paymentRepo.findById(paymentId);
    if (!existing) {
      throw new HttpError(STATUS_CODES.NOT_FOUND, MESSAGES.PAYMENT_NOT_FOUND);
    }

    const currentStatus = existing.status;

    if (currentStatus === PAYMENT_CONST.COMPLEATED || currentStatus === PAYMENT_CONST.FAILED) {
      throw new HttpError(
        STATUS_CODES.BAD_REQUEST,
        `Cannot update payment status from ${currentStatus} to ${newStatus}`
      );
    }

    const updated = await this._paymentRepo.updatePaymentStatus(paymentId, newStatus);
    if (!updated) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.PAYMENTS_STATUS_UPDATE_FAILED);
    }
    const account = await this._accountRepo.findById(updated.accountId.toString());
    if (!account) {
      throw new HttpError(STATUS_CODES.BAD_REQUEST, MESSAGES.ACCOUNT_NOT_FOUND);
    }
    if (newStatus === PAYMENT_CONST.COMPLEATED) {
      const balance = account.balance + updated.amount;
      await this._accountRepo.updateById(updated.accountId.toString(),{balance});
    }
    const notification = {
      accountName: account.name,
      message: IO.MESSAGES.PAYMENT_STATUS_UPDATED(newStatus, account.name),
      timestamp: new Date(),
    };
    await this._socketHandle.emitNotification(account.userId.toString(), notification, true);
    await redisDel(`${this.REDIS_CONST}:${updated.accountId}`);
    return toPaymentDto(updated);
  }
}