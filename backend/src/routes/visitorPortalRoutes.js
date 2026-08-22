import { Router } from 'express';
import { protectVisitor } from '../middleware/visitorAuth.js';
import { validate } from '../middleware/validate.js';
import {
  getMyOverview,
  listMyConversations,
  getMyConversationDetail,
  listMyLeads,
  updateMyProfile,
  changeMyPassword,
} from '../controllers/visitorSelfController.js';
import {
  listMyConversationsQuerySchema,
  listMyLeadsQuerySchema,
  updateMyProfileSchema,
  changeMyPasswordSchema,
} from '../validators/visitorSelfValidators.js';

// A visitor's own data — distinct from /visitor-auth (auth only) and
// /visitors (admin-facing, organization-wide browsing of tracked visitors).
// Every route here is scoped to the caller's own visitorId; there is no
// "list all" or "get by arbitrary id" here by design.
export const visitorPortalRoutes = Router();

visitorPortalRoutes.use(protectVisitor);

visitorPortalRoutes.get('/overview', getMyOverview);
visitorPortalRoutes.get('/conversations', validate(listMyConversationsQuerySchema, 'query'), listMyConversations);
visitorPortalRoutes.get('/conversations/:id', getMyConversationDetail);
visitorPortalRoutes.get('/leads', validate(listMyLeadsQuerySchema, 'query'), listMyLeads);
visitorPortalRoutes.patch('/profile', validate(updateMyProfileSchema), updateMyProfile);
visitorPortalRoutes.post('/change-password', validate(changeMyPasswordSchema), changeMyPassword);
