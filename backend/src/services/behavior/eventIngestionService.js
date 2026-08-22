import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import { getBehaviorSummary } from './behaviorSummaryService.js';
import { maybeRegenerateDna } from './dnaOrchestrationService.js';
import { logger } from '../../utils/logger.js';

export async function ingestEvents({ organizationId, visitorId, sessionId, events }) {
  const session = await prisma.session.findFirst({ where: { id: sessionId, organizationId, visitorId } });
  if (!session) throw AppError.notFound('Session not found for this visitor');

  await prisma.behaviorEvent.createMany({
    data: events.map((event) => ({
      organizationId,
      visitorId,
      sessionId,
      type: event.type,
      page: event.page,
      label: event.label,
      value: event.value,
      metadata: event.metadata,
      occurredAt: event.occurredAt ? new Date(event.occurredAt) : new Date(),
    })),
  });

  const { behaviorSummary, events: recentEvents, latestDna } = await getBehaviorSummary(visitorId);

  const visitor = await prisma.visitor.update({
    where: { id: visitorId },
    data: {
      lastSeenAt: new Date(),
      interestScore: behaviorSummary.interestScore,
      decisionStage: behaviorSummary.decisionStage,
    },
  });

  // Only the LLM-based qualitative regeneration is deferred — the heuristic
  // score above is already fresh and returned to the caller immediately.
  maybeRegenerateDna({ organizationId, visitor, behaviorSummary, events: recentEvents, latestDna }).catch((err) => {
    logger.error({ err, visitorId }, 'Background DNA orchestration failed');
  });

  return { behaviorSummary };
}
