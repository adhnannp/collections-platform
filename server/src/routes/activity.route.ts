import express from 'express';
import { roleMiddleware } from '../middleware/auth.middleware';
import { container } from '../di/container';
import { IAuthMiddleware } from '../core/interface/middleware/Iauth.middleware';
import { TYPES } from '../di/types';
import { IActivityController } from '../core/interface/controller/Iactivity.controller';
import AsyncHandler from 'express-async-handler';

const router = express.Router();
const activityController = container.get<IActivityController>(TYPES.ActivityController);
const AuthMiddleware = container.get<IAuthMiddleware>(TYPES.AuthMiddleware);
const auth = AuthMiddleware.handle.bind(AuthMiddleware);

router.use(auth);
/**
 * @swagger
 * /api/account/{id}/activities:
 *   post:
 *     summary: Log a new activity
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               meta:
 *                 type: object
 *     responses:
 *       201:
 *         description: Activity logged
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

router.post('/:id/activities', roleMiddleware(['Admin', 'Manager', 'Agent']), AsyncHandler(activityController.logActivity.bind(activityController)));
/**
 * @swagger
 * /api/account/{id}/activities:
 *   get:
 *     summary: Get activities for an account
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of activities
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/activities', roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']), AsyncHandler(activityController.getActivities.bind(activityController)));
/**
 * @swagger
 * /api/account/bulk:
 *   get:
 *     summary: Get bulk activities by account IDs
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountIds
 *             properties:
 *               accountIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: List of activities across multiple accounts
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/bulk', roleMiddleware(['Admin', 'Manager']), AsyncHandler(activityController.getBulkActivities.bind(activityController)));

export default router;