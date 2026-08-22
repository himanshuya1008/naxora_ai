import { z } from 'zod';

export const registerSchema = z.object({
  organizationName: z.string().trim().min(2, 'Organization name is too short').max(120),
  name: z.string().trim().min(2, 'Name is too short').max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
