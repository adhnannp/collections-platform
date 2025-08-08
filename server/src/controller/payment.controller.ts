import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../di/types';
import { IPaymentService } from '../core/interface/service/Ipayment.service';
import { STATUS_CODES } from '../utils/http.statuscodes';
import { querySchema, recordPaymentSchema } from '../validation/payment.schema';
import { treeifyError } from 'zod';
import { IPaymentController } from '../core/interface/controller/Ipayment.controller';

@injectable()
export class PaymentController implements IPaymentController{
  constructor(
    @inject(TYPES.PaymentService) private _paymentServ: IPaymentService
  ) {}

  async recordPayment(req: Request, res: Response): Promise<void> {
    const parsed = recordPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ errors: treeifyError(parsed.error) });
      return;
    }
    const payment = await this._paymentServ.recordPayment(req.params.id, parsed.data);
    res.status(STATUS_CODES.CREATED).json(payment);
  }

  async getPayments(req: Request, res: Response): Promise<void> {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ errors: treeifyError(parsed.error) });
      return;
    }
    const { page, limit } = parsed.data;
    const payments = await this._paymentServ.getPayments(req.params.id, page, limit);
    res.status(STATUS_CODES.OK).json(payments);
  }

  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    const statusSchema = recordPaymentSchema.shape.status;
    const parsed = statusSchema.safeParse(req.body.status);
    if (!parsed.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ errors: treeifyError(parsed.error) });
      return;
    }
    const payment = await this._paymentServ.updatePaymentStatus(req.params.paymentId, parsed.data);
    res.status(STATUS_CODES.OK).json(payment);
  }

}
