import express from 'express';
import { container } from '../di/container';
import { IAuthController } from '../core/interface/controller/Iauth.controller';
import { TYPES } from '../di/types';
import asyncHandler from 'express-async-handler';
import { authRateLimiter } from '../middleware/ratelimit.middleware';

const router = express.Router();
const authController = container.get<IAuthController>(TYPES.AuthController);

router.post('/register',authRateLimiter , asyncHandler(authController.register.bind(authController)));
router.post('/login', authRateLimiter, asyncHandler(authController.login.bind(authController)));
router.post('/refresh-token',asyncHandler(authController.refreshToken.bind(authController)));
router.post('/logout',asyncHandler(authController.logout.bind(authController)));

export default router;