import { z } from 'zod';

export const listVisitorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  minInterestScore: z.coerce.number().int().min(0).max(100).optional(),
  decisionStage: z.enum(['AWARENESS', 'CONSIDERATION', 'DECISION']).optional(),
  sortBy: z.enum(['lastSeenAt', 'interestScore']).default('lastSeenAt'),
});
