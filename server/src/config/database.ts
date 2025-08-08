import mongoose from 'mongoose';
import 'dotenv/config'
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!,{
      maxPoolSize: 100,
    });
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};