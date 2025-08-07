import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(['Admin', 'Manager', 'Agent', 'Viewer']),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
