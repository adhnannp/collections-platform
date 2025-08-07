import { createClient } from 'redis';
import logger from '../utils/logger';

const redisClient = createClient({
  url: process.env.REDIS_URL!,
});

redisClient.on('error', (err) => console.error('Redis error:', err));

export const connectRedis = async (): Promise<void> => {
  await redisClient.connect();
  logger.info('Redis connected');
};

export default redisClient;