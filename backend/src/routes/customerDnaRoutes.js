import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { analyzeCustomerDnaSchema, updateCustomerDnaSchema } from '../validators/customerDnaValidators.js';
import { analyze, getBySession, update, dashboard } from '../controllers/customerDnaController.js';

export const customerDnaRoutes = Router();

// Dashboard-facing surface — every route is JWT-authenticated (protect),
// matching the rest of this app's internal analytics/lead endpoints. This
// module has no anonymous/public-facing route: the raw signals it reads
// (behavior events, conversation transcripts) already arrive through the
// existing public tracking/voice endpoints, so Customer DNA itself only
// needs to be reachable by the dashboard.
customerDnaRoutes.post('/analyze', protect, validate(analyzeCustomerDnaSchema), analyze);
customerDnaRoutes.get('/dashboard', protect, dashboard);
customerDnaRoutes.get('/:sessionId', protect, getBySession);
customerDnaRoutes.put('/update', protect, validate(updateCustomerDnaSchema), update);
