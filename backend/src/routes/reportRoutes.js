import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getReport, regenerateReport, listReports } from '../controllers/reportController.js';

export const reportRoutes = Router();

reportRoutes.use(protect);

reportRoutes.get('/', listReports);
reportRoutes.get('/:conversationId', getReport);
reportRoutes.post('/:conversationId/regenerate', regenerateReport);
