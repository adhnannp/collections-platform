import express, { Request, Response } from 'express';
import cors from 'cors';
import 'reflect-metadata';
import helmet from 'helmet';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin.route';
import accountRoutes from './routes/account.route';
import paymentRoutes from './routes/payment.route';
import { setupSwagger } from './utils/swagger';
import { rateLimiter } from './middleware/ratelimit.middleware';
import {errorHandler} from './middleware/error.middleware';
import { setupMetrics } from './utils/metrics';
import { requestLogger } from './middleware/logger.middleware';
import cookieParser from 'cookie-parser';

const app = express();

app.use(rateLimiter);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);
setupMetrics(app);

// app.use('/admin/',adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/health', (req:Request, res:Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

setupSwagger(app);

app.use(errorHandler);

export const startServer = async () => {
  await connectDB();
  await connectRedis();
  return app;
};

export default app;