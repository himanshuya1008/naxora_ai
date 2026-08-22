import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyVoiceToken } from '../utils/tokens.js';
import { logger } from '../utils/logger.js';
import { registerConversationHandlers } from './conversationSocket.js';

export function initSocketServer(httpServer) {
  const allowedOrigins = Array.isArray(env.ALLOWED_ORIGINS) ? env.ALLOWED_ORIGINS : [env.ALLOWED_ORIGINS];

  const io = new Server(httpServer, {
    cors: {
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
    },
    maxHttpBufferSize: 5 * 1024 * 1024, // audio chunks are binary; allow generous frame size
  });

  io.use((socket, next) => {
    try {
      const { voiceToken } = socket.handshake.auth ?? {};
      if (!voiceToken) throw new Error('Missing voice token');

      const decoded = verifyVoiceToken(voiceToken);
      socket.data.conversationId = decoded.conversationId;
      socket.data.organizationId = decoded.organizationId;
      socket.data.visitorId = decoded.visitorId;
      next();
    } catch (err) {
      logger.warn({ err: err.message }, 'Socket authentication rejected');
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    logger.info({ conversationId: socket.data.conversationId }, 'Voice socket connected');
    registerConversationHandlers(io, socket);
  });

  return io;
}
