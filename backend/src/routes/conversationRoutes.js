import { Router } from 'express';
import { authenticateApiKey } from '../middleware/apiKeyAuth.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { trackingLimiter } from '../middleware/rateLimiter.js';
import {
  startConversation,
  startDashboardConversation,
  endConversation,
  listConversations,
  getConversation,
} from '../controllers/conversationController.js';
import { startConversationSchema, dashboardStartConversationSchema, listConversationsQuerySchema } from '../validators/conversationValidators.js';

export const conversationRoutes = Router();

// Public widget-facing: visitor's browser starts/ends its own voice call.
conversationRoutes.post('/start', trackingLimiter, authenticateApiKey, validate(startConversationSchema), startConversation);
conversationRoutes.post('/:id/end', trackingLimiter, authenticateApiKey, endConversation);

// Dashboard-facing: sales team reviewing conversations, or previewing/resuming
// a voice call with a tracked lead (or a standing demo visitor) from the UI.
conversationRoutes.post('/dashboard-start', protect, validate(dashboardStartConversationSchema), startDashboardConversation);
conversationRoutes.post('/:id/dashboard-end', protect, endConversation);
conversationRoutes.get('/', protect, validate(listConversationsQuerySchema, 'query'), listConversations);
conversationRoutes.get('/:id', protect, getConversation);
