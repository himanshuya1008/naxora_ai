import rateLimit from 'express-rate-limit';
import { env, isDevelopment } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// In-memory store — fine for a single Render instance. If this service scales
// to multiple instances, swap the `store` option for a Redis-backed store
// (rate-limit-redis) so limits are shared across processes.
function buildLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => next(AppError.tooManyRequests(message)),
  });
}

export const apiLimiter = buildLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later',
});

// Production keeps a hardcoded strict cap — never driven by an env var, so
// it can't be accidentally loosened via configuration. Development reads
// AUTH_RATE_LIMIT_MAX_DEV so repeated local register/login testing doesn't
// get blocked mid-session.
export const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? env.AUTH_RATE_LIMIT_MAX_DEV : 10,
  message: 'Too many authentication attempts, please try again later',
});

export const trackingLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Tracking event rate limit exceeded',
});
