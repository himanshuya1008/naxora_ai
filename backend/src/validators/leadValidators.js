import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(200).optional(),
  industry: z.string().trim().max(120).optional(),
  companySize: z.enum(['SOLO', 'SMALL', 'MID_MARKET', 'ENTERPRISE']).optional(),
  decisionMaker: z.coerce.boolean().optional(),
  teamSize: z.string().trim().max(60).optional(),
  budget: z.string().trim().max(120).optional(),
  timeline: z.string().trim().max(120).optional(),
  businessGoals: z.string().trim().max(2000).optional(),
  currentProblems: z.string().trim().max(2000).optional(),
  interestedService: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
  // Not `.refine(v => v === true)` here — that would force every caller of
  // this shared endpoint (BookDemo, Contact) to start sending consent too.
  // The "must be checked to submit" rule belongs to StayConnectedModal's own
  // form validation; this just accepts/stores whatever was captured.
  consentGiven: z.coerce.boolean().optional(),
  visitorId: z.string().cuid().optional(),
  source: z.enum(['BOOK_DEMO_FORM', 'CONTACT_FORM', 'VOICE_CALL']).default('CONTACT_FORM'),
});

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['NEW_LEAD', 'CONTACTED', 'QUALIFIED', 'DEMO_REQUESTED', 'PROPOSAL_SENT', 'CUSTOMER', 'WON', 'LOST']).optional(),
});
