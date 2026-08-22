import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getOverview, getTrends, getLeadAnalytics } from '../controllers/analyticsController.js';

export const analyticsRoutes = Router();

analyticsRoutes.use(protect);

analyticsRoutes.get('/overview', getOverview);
analyticsRoutes.get('/trends', getTrends);
analyticsRoutes.get('/leads', getLeadAnalytics);
