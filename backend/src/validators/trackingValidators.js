import { z } from 'zod';

export const identifyVisitorSchema = z.object({
  fingerprint: z.string().min(8).max(128),
  email: z.string().email().optional(),
  name: z.string().max(120).optional(),
  company: z.string().max(160).optional(),
});

export const startSessionSchema = z.object({
  visitorId: z.string().cuid(),
  referrer: z.string().max(2048).optional(),
  landingPage: z.string().max(2048).optional(),
  userAgent: z.string().max(512).optional(),
  deviceType: z.enum(['DESKTOP', 'MOBILE', 'TABLET', 'UNKNOWN']).default('UNKNOWN'),
  country: z.string().max(2).optional(),
  region: z.string().max(120).optional(),
});

export const endSessionSchema = z.object({
  durationSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
  pageViewCount: z.number().int().min(0).optional(),
  scrollDepthAvg: z.number().min(0).max(100).optional(),
});

const eventTypeEnum = z.enum([
  'PAGE_VIEW',
  'SCROLL_DEPTH',
  'CLICK',
  'DOWNLOAD',
  'SEARCH',
  'PRICING_VIEW',
  'ENTERPRISE_VIEW',
  'FAQ_VIEW',
  'CASE_STUDY_VIEW',
  'PRODUCT_VIEW',
  'FORM_SUBMIT',
  'VIDEO_PLAY',
  'SERVICE_VIEW',
  'DEMO_REQUEST',
]);

const behaviorEventSchema = z.object({
  type: eventTypeEnum,
  page: z.string().min(1).max(2048),
  label: z.string().max(256).optional(),
  value: z.number().finite().optional(),
  metadata: z.record(z.unknown()).optional(),
  occurredAt: z.string().datetime().optional(),
});

export const ingestEventsSchema = z.object({
  visitorId: z.string().cuid(),
  sessionId: z.string().cuid(),
  events: z.array(behaviorEventSchema).min(1).max(100),
});
