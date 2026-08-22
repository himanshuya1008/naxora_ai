import { prisma } from '../../config/db.js';
import { analyzeBehavior } from '../../ai/behaviorEngine/intentAnalyzer.js';

const EVENT_WINDOW = 300; // most recent events considered per behavior computation

/**
 * Single source of truth for "what do we currently know about this visitor's
 * behavior" — reused by event ingestion (for the instant score), the visitor
 * detail dashboard endpoint, and DNA regeneration (so they never disagree).
 */
export async function getBehaviorSummary(visitorId) {
  const [events, sessions, latestDna] = await Promise.all([
    prisma.behaviorEvent.findMany({
      where: { visitorId },
      orderBy: { occurredAt: 'desc' },
      take: EVENT_WINDOW,
    }),
    prisma.session.findMany({
      where: { visitorId },
      orderBy: { startedAt: 'desc' },
      take: 50,
    }),
    prisma.customerDNA.findFirst({
      where: { visitorId },
      orderBy: { version: 'desc' },
    }),
  ]);

  const behaviorSummary = analyzeBehavior({ events, sessions });

  return { behaviorSummary, events, sessions, latestDna };
}
