import { Request, Response } from 'express';

export interface IPaymentController {
  recordPayment(req: Request, res: Response): Promise<void>;
  getPayments(req: Request, res: Response): Promise<void>;
  updatePaymentStatus(req: Request, res: Response): Promise<void>;
}
