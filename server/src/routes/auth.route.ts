import express from 'express';
import { container } from '../di/container';
import { IAuthController } from '../core/interface/controller/Iauth.controller';
import { TYPES } from '../di/types';
import asyncHandler from 'express-async-handler';
import { authRateLimiter } from '../middleware/ratelimit.middleware';
import { IAuthMiddleware } from '../core/interface/middleware/Iauth.middleware';

const router = express.Router();
const authController = container.get<IAuthController>(TYPES.AuthController);
const AuthMiddleware = container.get<IAuthMiddleware>(TYPES.AuthMiddleware);
const auth = AuthMiddleware.handle.bind(AuthMiddleware);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Manager, Agent, Viewer]
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Bad request
 */
router.post('/register',authRateLimiter , asyncHandler(authController.register.bind(authController)));
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Unauthorized
 */
router.post('/login', authRateLimiter, asyncHandler(authController.login.bind(authController)));
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token obtained during login
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Refresh token not provided
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token',asyncHandler(authController.refreshToken.bind(authController)));
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user by invalidating refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: User not authenticated
 */
router.post('/logout',auth,asyncHandler(authController.logout.bind(authController)));

export default router;