import express from 'express';
import { ActivityController } from '../controller/activity.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/:id/activities', roleMiddleware(['Admin', 'Manager', 'Agent']), ActivityController.logActivity);
router.get('/:id/activities', roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']), ActivityController.getActivities);
router.get('/bulk', roleMiddleware(['Admin', 'Manager']), ActivityController.getBulkActivities);

export default router;