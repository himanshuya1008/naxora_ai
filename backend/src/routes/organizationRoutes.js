import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getOrganization,
  updateOrganization,
  listTeamMembers,
  listApiKeys,
  createApiKey,
  revokeApiKey,
} from '../controllers/organizationController.js';
import { updateOrganizationSchema, createApiKeySchema } from '../validators/organizationValidators.js';

export const organizationRoutes = Router();

organizationRoutes.use(protect);

organizationRoutes.get('/', getOrganization);
organizationRoutes.patch('/', restrictTo('OWNER', 'ADMIN'), validate(updateOrganizationSchema), updateOrganization);

organizationRoutes.get('/team', listTeamMembers);

organizationRoutes.get('/api-keys', restrictTo('OWNER', 'ADMIN'), listApiKeys);
organizationRoutes.post('/api-keys', restrictTo('OWNER', 'ADMIN'), validate(createApiKeySchema), createApiKey);
organizationRoutes.delete('/api-keys/:id', restrictTo('OWNER', 'ADMIN'), revokeApiKey);
