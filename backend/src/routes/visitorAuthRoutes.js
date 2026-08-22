import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/visitorAuthController.js';
import { validate } from '../middleware/validate.js';
import { visitorRegisterSchema, visitorLoginSchema, visitorRefreshSchema } from '../validators/visitorAuthValidators.js';
import { protectVisitor } from '../middleware/visitorAuth.js';
import { authenticateApiKey } from '../middleware/apiKeyAuth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

// Mounted separately from /auth (admin) per the V2 spec's "completely
// separate authentication flows" requirement. Register/login go through the
// same tracking-API-key auth as the public conversation-start flow, since
// that's how this app already resolves "which organization" for an
// anonymous marketing-site visitor — never trusted from the request body.
export const visitorAuthRoutes = Router();

visitorAuthRoutes.post('/register', authLimiter, authenticateApiKey, validate(visitorRegisterSchema), register);
visitorAuthRoutes.post('/login', authLimiter, authenticateApiKey, validate(visitorLoginSchema), login);
visitorAuthRoutes.post('/refresh', validate(visitorRefreshSchema), refresh);
visitorAuthRoutes.post('/logout', logout);
visitorAuthRoutes.get('/me', protectVisitor, me);
