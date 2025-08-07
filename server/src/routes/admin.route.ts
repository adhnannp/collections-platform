import express from 'express';
import { roleMiddleware } from '../middleware/auth.middleware';
import { AdminController } from '../controller/admin.controller';
import { container } from '../di/container';
import { IAuthMiddleware } from '../core/interface/middleware/Iauth.middleware';
import { TYPES } from '../di/types';

const router = express.Router();
const AuthMiddleware = container.get<IAuthMiddleware>(TYPES.AuthMiddleware);
const auth = AuthMiddleware.handle.bind(AuthMiddleware);

router.use(auth);

router.get('/heapdump', roleMiddleware(['Admin']), AdminController.getHeap);

export default router;