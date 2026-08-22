import { Router } from 'express';
import { authenticateApiKey } from '../middleware/apiKeyAuth.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { trackingLimiter } from '../middleware/rateLimiter.js';
import { createLead, listLeads, getLeadDetail } from '../controllers/leadController.js';
import { createLeadSchema, listLeadsQuerySchema } from '../validators/leadValidators.js';

export const leadRoutes = Router();

// Public-facing: marketing site Contact/Book Demo forms authenticate via the
// same tracking API key as the behavior tracker (visitor has no user session).
leadRoutes.post('/', trackingLimiter, authenticateApiKey, validate(createLeadSchema), createLead);

// Dashboard-facing.
leadRoutes.get('/', protect, validate(listLeadsQuerySchema, 'query'), listLeads);
leadRoutes.get('/:id', protect, getLeadDetail);
