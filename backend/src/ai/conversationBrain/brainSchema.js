import { z } from 'zod';

// Shared with finalCallSchema.js (Vapi end-of-call extraction) — the fields
// are the same whether captured incrementally per-turn or once from a full
// transcript, only the surrounding object (delta vs. final) differs.
export const leadCaptureFieldsSchema = z.object({
  name: z.string().optional().describe('Visitor\'s name, only if stated'),
  email: z.string().optional().describe('Email address, only if stated'),
  phone: z.string().optional().describe('Phone number — only if the visitor volunteered it, never asked for directly'),
  company: z.string().optional().describe('Company name, only if stated'),
  industry: z.string().optional(),
  companySize: z.enum(['SOLO', 'SMALL', 'MID_MARKET', 'ENTERPRISE']).optional().describe('Only if it can be confidently inferred from what they said'),
  decisionMaker: z.boolean().optional().describe('True/false only if their role in the buying decision was clearly stated or implied'),
  teamSize: z.string().optional().describe('e.g. "11-50" — only if stated'),
  budget: z.string().optional().describe('e.g. "$10k-50k/mo" — only if stated'),
  timeline: z.string().optional().describe('e.g. "next quarter" — only if stated'),
  businessGoals: z.string().optional(),
  currentProblems: z.string().optional(),
  interestedService: z.string().optional().describe('Which specific service they asked about, if any'),
});

// A single structured call performs every reasoning step the product spec
// describes (understand context -> update DNA -> update intent -> predict
// objection -> select strategy -> generate response) instead of chaining
// separate LLM round-trips. Voice UX needs sub-second-feeling turnaround;
// 5-6 sequential calls would add several seconds of dead air per turn.
export const conversationTurnSchema = z.object({
  contextUnderstanding: z.string().describe('1-2 sentence internal summary of what the visitor just communicated and why it matters'),

  interestScoreDelta: z.number().int().min(-25).max(25).describe('Change to apply to the 0-100 interest score based on this turn'),
  trustScoreDelta: z.number().int().min(-25).max(25).describe('Change to apply to the 0-100 trust score based on this turn'),
  buyingProbabilityDelta: z.number().int().min(-25).max(25).describe('Change to apply to the 0-100 buying probability based on this turn'),
  sentimentScore: z.number().min(-1).max(1).describe("The visitor's emotional sentiment in this turn, -1 (very negative) to 1 (very positive)"),

  objectionDetected: z
    .object({
      type: z.enum(['PRICE', 'TRUST', 'TIMING', 'COMPETITOR', 'FEATURE_GAP', 'AUTHORITY', 'OTHER']),
      detail: z.string(),
    })
    .optional()
    .describe('An objection the visitor raised or implied this turn — omit entirely if none'),

  strategy: z
    .enum([
      'DISCOVERY_QUESTION',
      'EXPLAIN_FEATURE',
      'HANDLE_OBJECTION',
      'SHARE_ROI',
      'SHARE_CASE_STUDY',
      'OFFER_DEMO',
      'RECOMMEND_PLAN',
      'QUALIFY_LEAD',
      'SMALL_TALK',
      'END_CONVERSATION',
    ])
    .describe('The single best next sales move given everything known about this visitor'),

  leadCapture: leadCaptureFieldsSchema.describe(
    'Any NEW lead-qualification facts the visitor volunteered THIS turn, in their own words. Omit a field entirely unless the visitor actually said it this turn — never guess or infer a field, and never repeat a fact already shown in the LEAD PROFILE section of the prompt.'
  ),

  response: z
    .string()
    .describe(
      'The exact words the AI sales consultant says next, spoken naturally out loud (no markdown, no bullet points, no headers) — this is sent directly to text-to-speech'
    ),
});
