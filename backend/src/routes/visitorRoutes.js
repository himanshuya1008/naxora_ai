import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listVisitors, getVisitor, getVisitorDnaHistory } from '../controllers/visitorController.js';
import { listVisitorsQuerySchema } from '../validators/visitorValidators.js';

export const visitorRoutes = Router();

visitorRoutes.use(protect);

visitorRoutes.get('/', validate(listVisitorsQuerySchema, 'query'), listVisitors);
visitorRoutes.get('/:id', getVisitor);
visitorRoutes.get('/:id/dna-history', getVisitorDnaHistory);
