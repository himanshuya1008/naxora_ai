import { z } from 'zod';

// Mirrors the Prisma enums in schema.prisma — kept in one place so the LLM's
// structured output can never produce a value the database will reject.
export const customerDnaSchema = z.object({
  buyingIntent: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).describe('Overall likelihood this visitor is actively evaluating a purchase'),
  budgetSensitivity: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('How price-sensitive this visitor is likely to be'),
  technicalKnowledge: z.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']).describe('Technical sophistication inferred from pages/content engaged with'),
  decisionSpeed: z.enum(['SLOW', 'MODERATE', 'FAST']).describe('How quickly this visitor is likely to move through a sales cycle'),
  communicationStyle: z
    .enum(['ANALYTICAL', 'DRIVER', 'EXPRESSIVE', 'AMIABLE'])
    .describe('DISC-style communication preference to adapt the sales tone to'),
  industry: z.string().optional().describe('Best-guess industry — omit if there is no signal'),
  companySize: z.enum(['SOLO', 'SMALL', 'MID_MARKET', 'ENTERPRISE']).optional().describe('Best-guess company size — omit if there is no signal'),
  likelyObjections: z
    .array(z.enum(['PRICE', 'TRUST', 'TIMING', 'COMPETITOR', 'FEATURE_GAP', 'AUTHORITY', 'OTHER']))
    .describe('1-4 objection categories most likely to come up in conversation'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Risk that this lead churns or disengages without proactive outreach'),
  personality: z.string().describe('A short (3-8 word) human-readable personality descriptor, e.g. "pragmatic, data-driven decision maker"'),
  reasoning: z.string().describe('2-4 sentences explaining, from the behavior data, why these conclusions were drawn'),
});
