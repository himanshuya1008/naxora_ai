import http from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { verifyDeepgramCredentials } from './config/deepgram.js';
import { logger } from './utils/logger.js';
import { initSocketServer } from './sockets/index.js';
import { startStaleConversationSweeper } from './jobs/staleConversationSweeper.js';

async function bootstrap() {
  await connectDatabase();
  // Non-fatal: a bad Deepgram key should only break voice calls, not the
  // whole app (auth/dashboard/etc. don't depend on it) — just log loudly.
  verifyDeepgramCredentials();

  const app = createApp();
  const httpServer = http.createServer(app);

  initSocketServer(httpServer);
  const sweeperInterval = startStaleConversationSweeper();

  httpServer.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    clearInterval(sweeperInterval);
    httpServer.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });

    // Force-exit if connections don't close in time.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception — shutting down');
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
