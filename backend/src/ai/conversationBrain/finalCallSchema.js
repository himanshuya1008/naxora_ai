import { z } from 'zod';
import { leadCaptureFieldsSchema } from './brainSchema.js';

// Used once, after a Vapi call ends, to extract from the FULL transcript what
// conversationTurnSchema would otherwise have accumulated turn-by-turn. Vapi
// runs the live conversation itself, so there are no incremental deltas to
// sum — these are absolute final scores, not per-turn changes.
export const finalCallExtractionSchema = z.object({
  interestScore: z.number().int().min(0).max(100).describe("The visitor's final interest level, 0-100"),
  trustScore: z.number().int().min(0).max(100).describe("The visitor's final trust level, 0-100"),
  buyingProbability: z.number().int().min(0).max(100).describe('Final estimated probability the visitor becomes a customer, 0-100'),
  sentimentScore: z.number().min(-1).max(1).describe("The visitor's overall emotional sentiment across the call, -1 to 1"),
  objections: z
    .array(
      z.object({
        type: z.enum(['PRICE', 'TRUST', 'TIMING', 'COMPETITOR', 'FEATURE_GAP', 'AUTHORITY', 'OTHER']),
        detail: z.string(),
      })
    )
    .default([])
    .describe('Every distinct objection the visitor raised anywhere in the call'),
  leadCapture: leadCaptureFieldsSchema.describe('Every lead-qualification fact the visitor volunteered anywhere in the call, in their own words — omit a field entirely if never stated.'),
});
