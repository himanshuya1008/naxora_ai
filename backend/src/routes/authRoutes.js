import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/authValidators.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validate(registerSchema), register);
authRoutes.post('/login', authLimiter, validate(loginSchema), login);
authRoutes.post('/refresh', validate(refreshSchema), refresh);
authRoutes.post('/logout', logout);
authRoutes.get('/me', protect, me);
