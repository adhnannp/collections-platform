import express from 'express';
import { roleMiddleware } from '../middleware/auth.middleware';
import asyncHandler from 'express-async-handler';
import { IPaymentController } from '../core/interface/controller/Ipayment.controller';
import { TYPES } from '../di/types';
import { container } from '../di/container';
import { IAuthMiddleware } from '../core/interface/middleware/Iauth.middleware';

const router = express.Router();

const paymentController = container.get<IPaymentController>(TYPES.PaymentController);
const AuthMiddleware = container.get<IAuthMiddleware>(TYPES.AuthMiddleware);
const auth = AuthMiddleware.handle.bind(AuthMiddleware);

router.use(auth);
/**
 * @swagger
 * /api/payments/{paymentId}:
 *   put:
 *     summary: Update payment status
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment status updated
 *       400:
 *         description: Validation error
 */
router.put(
  '/:paymentId',
  roleMiddleware(['Admin', 'Manager']),
  asyncHandler(paymentController.updatePaymentStatus.bind(paymentController))
);

export default router;