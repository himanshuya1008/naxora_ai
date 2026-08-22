import { z } from 'zod';

export const analyzeCustomerDnaSchema = z.object({
  sessionId: z.string().min(1),
  customerId: z.string().min(1),
});

export const updateCustomerDnaSchema = z.object({
  sessionId: z.string().min(1),
  personality: z.enum(['DECISION_MAKER', 'TECHNICAL_BUYER', 'BUSINESS_BUYER', 'RESEARCHER', 'EXPLORER', 'STUDENT', 'ENTERPRISE_BUYER']).optional(),
  communicationStyle: z.enum(['ANALYTICAL', 'DRIVER', 'EXPRESSIVE', 'AMIABLE']).optional(),
  preferredLanguage: z.string().min(2).max(10).optional(),
  budgetLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ENTERPRISE']).optional(),
  companySize: z.enum(['SOLO', 'SMALL', 'MID_MARKET', 'ENTERPRISE']).optional(),
  industry: z.string().optional(),
  nextBestAction: z.enum(['DEMO', 'PRICING', 'CASE_STUDY', 'ENTERPRISE_PLAN', 'FOLLOW_UP_CALL', 'SCHEDULE_MEETING', 'FREE_TRIAL']).optional(),
  conversationSummary: z.string().optional(),
});
