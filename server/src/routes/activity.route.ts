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

router.post('/:id/activities', roleMiddleware(['Admin', 'Manager', 'Agent']), AsyncHandler(activityController.logActivity.bind(activityController)));
router.get('/:id/activities', roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']), AsyncHandler(activityController.getActivities.bind(activityController)));
router.get('/bulk', roleMiddleware(['Admin', 'Manager']), AsyncHandler(activityController.getBulkActivities.bind(activityController)));

export default router;