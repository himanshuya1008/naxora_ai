import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
});

export const createApiKeySchema = z.object({
  label: z.string().trim().min(2).max(120),
  type: z.enum(['TRACKING_PUBLIC', 'SERVER']).default('TRACKING_PUBLIC'),
});
