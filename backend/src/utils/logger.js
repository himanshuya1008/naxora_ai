import pino from 'pino';
import { env, isDevelopment } from '../config/env.js';

// Structured JSON logs in production (Render aggregates these natively);
// human-readable pretty-print in development.
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
    : undefined,
  base: { service: 'sales-intelligence-backend' },
});

export default logger;
