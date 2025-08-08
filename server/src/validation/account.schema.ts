import { z } from 'zod';

export const accountCreateSchema = z.object({
  name: z.string().min(1),
  mobileNumber: z.string().min(5),
  address: z.string().min(1),
  balance: z.number().nonnegative().default(0),
  status: z.enum(['active', 'inactive', 'delinquent']).optional(),
});

export const accountUpdateSchema = accountCreateSchema.partial();

export const accountQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.string().default('createdAt'),
});

export const advancedSearchSchema = z.object({
  query: z.string().optional(),
  dateRange: z
    .object({
      start: z.string().refine(
        (val) => /^\d{4}-\d{2}-\d{2}/.test(val),
        { message: 'Invalid start date format (YYYY-MM-DD)' }
      ),
      end: z.string().refine(
        (val) => /^\d{4}-\d{2}-\d{2}/.test(val),
        { message: 'Invalid end date format (YYYY-MM-DD)' }
      ),
    })
    .optional(),
  customFields: z.record(z.string(), z.any()).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});