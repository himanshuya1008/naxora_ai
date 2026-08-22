import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from '../ai/conversationBrain/languages.js';

const languageSchema = z.enum(SUPPORTED_LANGUAGES).optional();

export const startConversationSchema = z.object({
  visitorId: z.string().optional(),
  sessionId: z.string().optional(),
  language: languageSchema,
});

export const dashboardStartConversationSchema = z.object({
  visitorId: z.string().optional(),
  language: languageSchema,
});

export const listConversationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'ENDED', 'ABANDONED']).optional(),
});
