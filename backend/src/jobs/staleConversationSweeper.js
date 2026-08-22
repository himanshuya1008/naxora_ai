import { prisma } from '../config/db.js';
import { endConversation } from '../services/conversationService.js';
import { logger } from '../utils/logger.js';

const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
const STALE_AFTER_MS = 15 * 60 * 1000; // no activity for 15 minutes = abandoned

/**
 * Safety net for conversations that never got a clean Socket.IO disconnect
 * (browser crash, network drop, device sleep). Without this, such a
 * conversation would stay ACTIVE forever and never get a sales report.
 */
async function sweepStaleConversations() {
  const staleBefore = new Date(Date.now() - STALE_AFTER_MS);

  const staleConversations = await prisma.conversation.findMany({
    where: { status: 'ACTIVE', updatedAt: { lt: staleBefore } },
    select: { id: true, organizationId: true },
  });

  for (const conversation of staleConversations) {
    try {
      await endConversation({ organizationId: conversation.organizationId, conversationId: conversation.id, status: 'ABANDONED' });
      logger.info({ conversationId: conversation.id }, 'Marked stale conversation as abandoned');
    } catch (err) {
      logger.error({ err, conversationId: conversation.id }, 'Failed to sweep stale conversation');
    }
  }
}

export function startStaleConversationSweeper() {
  const interval = setInterval(() => {
    sweepStaleConversations().catch((err) => logger.error({ err }, 'Stale conversation sweep failed'));
  }, SWEEP_INTERVAL_MS);

  interval.unref(); // never keep the process alive on its own
  return interval;
}
