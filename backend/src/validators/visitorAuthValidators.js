import { z } from 'zod';

// No `organizationId` field — resolved server-side from the tracking API key
// (see authenticateApiKey), never trusted from the client. `fingerprint` is
// optional: when present and it matches an existing anonymous Visitor row
// for this org, registration upgrades that row in place instead of creating
// a duplicate (see visitorAuthController.register).
export const visitorRegisterSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  fingerprint: z.string().trim().min(1).max(200).optional(),
});

export const visitorLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password is required'),
});

export const visitorRefreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
