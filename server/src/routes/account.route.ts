import express from 'express';
import { AccountController } from '../controller/account.controller';
import { roleMiddleware } from '../middleware/auth.middleware';
import { IPaymentController } from '../core/interface/controller/Ipayment.controller';
import { TYPES } from '../di/types';
import { container } from '../di/container';
import expressAsyncHandler from 'express-async-handler';
import { IAuthMiddleware } from '../core/interface/middleware/Iauth.middleware';

const paymentController = container.get<IPaymentController>(TYPES.PaymentController);
const AuthMiddleware = container.get<IAuthMiddleware>(TYPES.AuthMiddleware);
const auth = AuthMiddleware.handle.bind(AuthMiddleware);


const router = express.Router();

router.use(auth);

router.get('/', roleMiddleware(['Admin', 'Manager', 'Agent']), AccountController.listAccounts);
router.post('/', roleMiddleware(['Admin', 'Manager']), AccountController.createAccount);
router.get('/:id', roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']), AccountController.getAccount);
router.put('/:id', roleMiddleware(['Admin', 'Manager']), AccountController.updateAccount);
router.delete('/:id', roleMiddleware(['Admin']), AccountController.deleteAccount);
router.post('/bulk-update', roleMiddleware(['Admin']), AccountController.bulkUpdate);
router.post('/search', roleMiddleware(['Admin', 'Manager', 'Agent']), AccountController.advancedSearch);


router.post(
  '/:id/payments',
  roleMiddleware(['Admin', 'Manager']),
  expressAsyncHandler(paymentController.recordPayment.bind(paymentController))
);

router.get(
  '/:id/payments',
  roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']),
  expressAsyncHandler(paymentController.getPayments.bind(paymentController))
);

export default router;