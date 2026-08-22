import { z } from 'zod';

export const salesReportSchema = z.object({
  transcriptSummary: z.string().describe('4-6 sentence executive summary of the conversation'),
  salesPerformanceScore: z.number().int().min(0).max(100).describe("Quality of the AI consultant's performance in this conversation"),
  buyingProbability: z.number().int().min(0).max(100).describe('Final estimated probability this lead converts'),
  recommendations: z.array(z.string()).min(1).max(6).describe('Concrete recommendations for the human sales team on this lead'),
  missedOpportunities: z.array(z.string()).max(6).describe('Moments the AI consultant could have handled better, or signals it may have under-used'),
  suggestedFollowUp: z
    .array(
      z.object({
        channel: z.enum(['EMAIL', 'PHONE', 'DEMO', 'PROPOSAL']),
        message: z.string(),
        suggestedDate: z.string().describe('ISO date string for when this follow-up should happen'),
      })
    )
    .min(1)
    .max(4),
  crmSummary: z.object({
    dealStage: z.enum(['NEW', 'QUALIFIED', 'DEMO_REQUESTED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    summary: z.string().describe('1-2 sentence CRM-ready note for the account'),
    tags: z.array(z.string()).max(8),
  }),
});
