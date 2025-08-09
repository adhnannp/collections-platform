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

/**
 * @swagger
 * tags:
 *   - name: Accounts
 *     description: Operations related to customer accounts
 *   - name: Payments
 *     description: Operations related to payment processing
 */
const router = express.Router();

router.use(auth);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: List all accounts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: List of accounts
 *       400:
 *         description: Bad request
 */
router.get('/', roleMiddleware(['Admin', 'Manager', 'Agent','Viewer']), expressAsyncHandler(accountController.listAccounts.bind(accountController)));
/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Validation error
 */
router.post('/', roleMiddleware(['Admin', 'Manager']), expressAsyncHandler(accountController.createAccount.bind(accountController)));
/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account data
 *       400:
 *         description: Not found or bad request
 */
router.get('/:id', roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']), expressAsyncHandler(accountController.getAccount.bind(accountController)));
/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Update an account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *       400:
 *         description: Validation error or not found
 */
router.put('/:id', roleMiddleware(['Admin', 'Manager']), expressAsyncHandler(accountController.updateAccount.bind(accountController)));
/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Delete an account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       400:
 *         description: Not found
 */
router.delete('/:id', roleMiddleware(['Admin']), expressAsyncHandler(accountController.deleteAccount.bind(accountController)));
/**
 * @swagger
 * /api/accounts/bulk-update:
 *   post:
 *     summary: Bulk update multiple accounts
 *     description: Allows an Admin to update multiple accounts at once. Each update contains an account ID and the fields to update.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 description: List of account updates
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - data
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Account ID to update
 *                       example: "64b1f2c9d4a5e2f4a1b2c3d4"
 *                     data:
 *                       type: object
 *                       description: Partial account fields to update
 *                       additionalProperties: true
 *                       example:
 *                         isListed: false
 *                         accountName: "Updated Name"
 *     responses:
 *       200:
 *         description: Bulk update operation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: integer
 *                   example: 3
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example: []
 *       400:
 *         description: Bad request or validation error
 */
router.post('/bulk-update', roleMiddleware(['Admin']), expressAsyncHandler(accountController.bulkUpdate.bind(accountController)));
/**
 * @swagger
 * /api/accounts/search:
 *   post:
 *     summary: Perform advanced search on accounts
 *     description: Search accounts with filters, text queries, date ranges, and custom fields.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Text search query
 *                 example: "John Doe"
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-01T00:00:00.000Z"
 *                   end:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-31T23:59:59.999Z"
 *               customFields:
 *                 type: object
 *                 description: Additional MongoDB-style filters
 *                 example:
 *                   status: "active"
 *                   country: "US"
 *               page:
 *                 type: integer
 *                 default: 1
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 example: 20
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       400:
 *         description: Validation error
 */
router.post('/search', roleMiddleware(['Admin', 'Manager', 'Agent']), expressAsyncHandler(accountController.advancedSearch.bind(accountController)));

/**
 * @swagger
 * /api/accounts/{id}/payments:
 *   post:
 *     summary: Record a payment for an account
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded
 *       400:
 *         description: Validation error
 */
router.post(
  '/:id/payments',
  roleMiddleware(['Admin', 'Manager']),
  expressAsyncHandler(paymentController.recordPayment.bind(paymentController))
);
/**
 * @swagger
 * /api/accounts/{id}/payments:
 *   get:
 *     summary: Get payments for an account
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of payments
 *       400:
 *         description: Invalid query
 */
router.get(
  '/:id/payments',
  roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']),
  expressAsyncHandler(paymentController.getPayments.bind(paymentController))
);

export default router;