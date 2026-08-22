import { z } from 'zod';

export const listMyConversationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const listMyLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateMyProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(120).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  company: z.string().trim().max(160).optional(),
  industry: z.string().trim().max(120).optional(),
});

export const changeMyPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});
