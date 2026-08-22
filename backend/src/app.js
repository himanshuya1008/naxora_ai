import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';
import { vapiRoutes } from './routes/vapiRoutes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // required for correct client IPs / rate limiting behind Render's proxy

  const allowedOrigins = Array.isArray(env.ALLOWED_ORIGINS) ? env.ALLOWED_ORIGINS : [env.ALLOWED_ORIGINS];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin === env.CLIENT_URL) {
          return callback(null, true);
        }
        if (/^https:\/\/.*\.vercel\.app$/.test(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-Requested-With'],
    })
  );
  app.use(compression());

  // Mounted BEFORE express.json(): this route needs the untouched raw request
  // body to verify Vapi's webhook secret, and parses JSON itself afterward.
  app.use('/api/vapi', vapiRoutes);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/api/health' },
    })
  );

  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
  });

  // This is an API-only server — there's no HTML app at "/" (the frontend
  // is a separate app, e.g. http://localhost:5173). Without this, hitting
  // the bare backend URL in a browser returns an unhelpful 404 from the
  // catch-all below, which reads as "the server is broken" rather than
  // "you're looking at the API directly."
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      name: 'Nexora AI API',
      status: 'ok',
      health: '/api/health',
    });
  });

  app.use('/api', apiLimiter, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
