import { z } from 'zod';

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  status: z.enum(['pending', 'completed', 'failed']),
});

export const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});


