import express from 'express';
import { PaymentController } from '../controller/payment.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/:id/payments', roleMiddleware(['Admin', 'Manager']), PaymentController.recordPayment);
router.get('/:id/payments', roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']), PaymentController.getPayments);
router.put('/payments/:paymentId', roleMiddleware(['Admin', 'Manager']), PaymentController.updatePaymentStatus);

export default router;