import { prisma } from '../../config/db.js';
import { generateCustomerDna } from '../../ai/customerDNA/dnaGenerator.js';
import { getBehaviorSummary } from './behaviorSummaryService.js';
import { logger } from '../../utils/logger.js';
import { DNA_REGENERATION_EVENT_THRESHOLD, DNA_REGENERATION_MIN_INTERVAL_MS } from '../../ai/behaviorEngine/scoringConfig.js';

/**
 * Decides whether enough new signal has accumulated to justify an LLM call,
 * and regenerates the qualitative Customer DNA profile if so. Expects the
 * caller to already have a fresh behaviorSummary/events/latestDna (from
 * getBehaviorSummary) — this function does no DB reads of its own besides
 * the write, so it's cheap to call speculatively and safe to fire-and-forget.
 */
export async function maybeRegenerateDna({ organizationId, visitor, behaviorSummary, events, latestDna }) {
  const eventsSinceLastDna = latestDna ? events.filter((e) => new Date(e.occurredAt) > latestDna.createdAt).length : events.length;
  const msSinceLastDna = latestDna ? Date.now() - latestDna.createdAt.getTime() : Infinity;

  const shouldRegenerate =
    !latestDna || (eventsSinceLastDna >= DNA_REGENERATION_EVENT_THRESHOLD && msSinceLastDna >= DNA_REGENERATION_MIN_INTERVAL_MS);

  if (!shouldRegenerate) return latestDna;

  try {
    return await generateCustomerDna({ organizationId, visitor, behaviorSummary });
  } catch (err) {
    logger.error({ err, visitorId: visitor.id }, 'DNA regeneration failed, keeping previous profile');
    return latestDna;
  }
}

/**
 * A completed voice conversation is itself a strong, explicit signal — unlike
 * the periodic event-threshold check in maybeRegenerateDna above, this always
 * regenerates (no gating) so the qualitative CustomerDNA profile reflects
 * what was just said on the call, not just prior on-site browsing behavior.
 */
export async function regenerateDnaAfterConversation({ organizationId, visitorId }) {
  const visitor = await prisma.visitor.findUnique({ where: { id: visitorId } });
  if (!visitor) return null;

  const { behaviorSummary } = await getBehaviorSummary(visitorId);

  try {
    return await generateCustomerDna({ organizationId, visitor, behaviorSummary });
  } catch (err) {
    logger.error({ err, visitorId }, 'DNA regeneration after conversation end failed');
    return null;
  }
}
