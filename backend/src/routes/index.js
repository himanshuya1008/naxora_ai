import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { visitorAuthRoutes } from './visitorAuthRoutes.js';
import { visitorPortalRoutes } from './visitorPortalRoutes.js';
import { organizationRoutes } from './organizationRoutes.js';
import { trackingRoutes } from './trackingRoutes.js';
import { visitorRoutes } from './visitorRoutes.js';
import { conversationRoutes } from './conversationRoutes.js';
import { reportRoutes } from './reportRoutes.js';
import { analyticsRoutes } from './analyticsRoutes.js';
import { voiceRoutes } from './voiceRoutes.js';
import { leadRoutes } from './leadRoutes.js';
import { customerDnaRoutes } from './customerDnaRoutes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/visitor-auth', visitorAuthRoutes);
apiRouter.use('/visitor-portal', visitorPortalRoutes);
apiRouter.use('/organization', organizationRoutes);
apiRouter.use('/tracking', trackingRoutes);
apiRouter.use('/visitors', visitorRoutes);
apiRouter.use('/conversations', conversationRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/voice', voiceRoutes);
apiRouter.use('/leads', leadRoutes);
apiRouter.use('/customer-dna', customerDnaRoutes);
