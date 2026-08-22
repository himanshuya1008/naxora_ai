import { Router } from 'express';
import { authenticateApiKey } from '../middleware/apiKeyAuth.js';
import { trackingLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { identifyVisitor, startSession, endSession, ingestEvents } from '../controllers/trackingController.js';
import { identifyVisitorSchema, startSessionSchema, endSessionSchema, ingestEventsSchema } from '../validators/trackingValidators.js';

// Public-facing (frontend tracking snippet) — authenticated via a
// per-organization API key rather than a user session/JWT.
export const trackingRoutes = Router();

trackingRoutes.use(trackingLimiter, authenticateApiKey);

trackingRoutes.post('/identify', validate(identifyVisitorSchema), identifyVisitor);
trackingRoutes.post('/sessions', validate(startSessionSchema), startSession);
trackingRoutes.patch('/sessions/:sessionId', validate(endSessionSchema), endSession);
trackingRoutes.post('/events', validate(ingestEventsSchema), ingestEvents);
