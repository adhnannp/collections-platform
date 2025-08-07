import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { AdminController } from '../controller/admin.controller';

const router = express.Router();

router.get('/heapdump', authMiddleware, roleMiddleware(['Admin']), AdminController.getHeap);

export default router;