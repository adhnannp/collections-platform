import express from 'express';
import { roleMiddleware } from '../middleware/auth.middleware';
import { IPaymentController } from '../core/interface/controller/Ipayment.controller';
import { TYPES } from '../di/types';
import { container } from '../di/container';
import expressAsyncHandler from 'express-async-handler';
import { IAuthMiddleware } from '../core/interface/middleware/Iauth.middleware';
import { IAccountController } from '../core/interface/controller/Iaccount.controller';

const paymentController = container.get<IPaymentController>(TYPES.PaymentController);
const accountController = container.get<IAccountController>(TYPES.AccountController);
const AuthMiddleware = container.get<IAuthMiddleware>(TYPES.AuthMiddleware);
const auth = AuthMiddleware.handle.bind(AuthMiddleware);


const router = express.Router();

router.use(auth);

router.get('/', roleMiddleware(['Admin', 'Manager', 'Agent','Viewer']), expressAsyncHandler(accountController.listAccounts.bind(accountController)));
router.post('/', roleMiddleware(['Admin', 'Manager']), expressAsyncHandler(accountController.createAccount.bind(accountController)));
router.get('/:id', roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']), expressAsyncHandler(accountController.getAccount.bind(accountController)));
router.put('/:id', roleMiddleware(['Admin', 'Manager']), expressAsyncHandler(accountController.updateAccount.bind(accountController)));
router.delete('/:id', roleMiddleware(['Admin']), expressAsyncHandler(accountController.deleteAccount.bind(accountController)));
router.post('/bulk-update', roleMiddleware(['Admin']), expressAsyncHandler(accountController.bulkUpdate.bind(accountController)));
router.post('/search', roleMiddleware(['Admin', 'Manager', 'Agent']), expressAsyncHandler(accountController.advancedSearch.bind(accountController)));


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