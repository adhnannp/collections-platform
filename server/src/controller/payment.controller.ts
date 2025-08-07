import { Request, Response } from 'express';
import { PaymentService } from '../service/payment.service';

export class PaymentController {
  static async recordPayment(req: Request, res: Response) {
    try {
      const io = req.app.get('io');
      const payment = await PaymentService.recordPayment(req.params.id, req.body, io);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getPayments(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const payments = await PaymentService.getPayments(req.params.id, Number(page), Number(limit));
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async updatePaymentStatus(req: Request, res: Response) {
    try {
      const payment = await PaymentService.updatePaymentStatus(req.params.paymentId, req.body.status);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}