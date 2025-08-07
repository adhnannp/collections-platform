import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request } from 'express';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req: Request): string => {
    return req.user?._id?.toString() ?? ipKeyGenerator(req as any);
  },
  message: 'Too many requests, please try again later.',
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.',
});