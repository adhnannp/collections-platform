import redisClient from '../config/redis';

export const redisGet = async <T>(key: string): Promise<T | null> => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const redisSet = async (key: string, value: any, ttlSeconds: number): Promise<void> => {
  await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
};

export const redisDel = async (...keys: string[]): Promise<void> => {
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};
