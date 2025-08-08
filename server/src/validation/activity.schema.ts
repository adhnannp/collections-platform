import { z } from 'zod';
import mongoose from 'mongoose';

export const logActivitySchema = z.object({
  type: z.enum(['call', 'email', 'note']),
  description: z.string().min(1),
});

export const activityParamsSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid account ID',
  }),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
});

export const bulkActivitiesSchema = z.object({
  accountIds: z.array(z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid account ID in list',
  })),
});
