import express from 'express';
import { ActivityController } from '../controller/activity.controller';
import { roleMiddleware } from '../middleware/auth.middleware';
import { container } from '../di/container';
import { IAuthMiddleware } from '../core/interface/middleware/Iauth.middleware';
import { TYPES } from '../di/types';

const router = express.Router();
const AuthMiddleware = container.get<IAuthMiddleware>(TYPES.AuthMiddleware);
const auth = AuthMiddleware.handle.bind(AuthMiddleware);

router.use(auth);

router.post('/:id/activities', roleMiddleware(['Admin', 'Manager', 'Agent']), ActivityController.logActivity);
router.get('/:id/activities', roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']), ActivityController.getActivities);
router.get('/bulk', roleMiddleware(['Admin', 'Manager']), ActivityController.getBulkActivities);

export default router;