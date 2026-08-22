import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import { buildProfile } from './profileBuilder.js';
import * as memoryManager from './memoryManager.js';

const EVENT_WINDOW = 300; // most recent behavior events considered per profile build

/**
 * Gathers every raw signal profileBuilder.js needs for one customer, from
 * whichever tables already hold it. This is the ONLY place in the module
 * that reads from tables it doesn't own (BehaviorEvent, Session, Message,
 * ObjectionLog, ConversationScoreSnapshot, Lead, Visitor) — the integration
 * point described in the module's architecture diagram as "Voice Bot ->
 * Customer DNA Service": this module consumes what the voice pipeline and
 * website tracker already persisted, without calling into either directly.
 */
async function gatherRawData({ organizationId, sessionId, customerId }) {
  const visitor = await prisma.visitor.findFirst({ where: { id: customerId, organizationId } });
  if (!visitor) throw AppError.notFound('Customer not found');

  const [events, sessions, sessionScopedConversation] = await Promise.all([
    prisma.behaviorEvent.findMany({
      where: { visitorId: customerId, organizationId },
      orderBy: { occurredAt: 'desc' },
      take: EVENT_WINDOW,
    }),
    prisma.session.findMany({ where: { visitorId: customerId, organizationId }, orderBy: { startedAt: 'desc' }, take: 50 }),
    prisma.conversation.findFirst({ where: { sessionId, organizationId }, orderBy: { startedAt: 'desc' } }),
  ]);

  // Prefer the conversation tied to this exact session; fall back to the
  // customer's most recent conversation overall so re-analyzing from a new
  // session still benefits from a prior call's transcript.
  const conversation =
    sessionScopedConversation ??
    (await prisma.conversation.findFirst({ where: { visitorId: customerId, organizationId }, orderBy: { startedAt: 'desc' } }));

  const [messages, objectionLogs, latestScoreSnapshot, lead] = await Promise.all([
    conversation ? prisma.message.findMany({ where: { conversationId: conversation.id }, orderBy: { sequence: 'asc' } }) : Promise.resolve([]),
    conversation ? prisma.objectionLog.findMany({ where: { conversationId: conversation.id } }) : Promise.resolve([]),
    conversation
      ? prisma.conversationScoreSnapshot.findFirst({ where: { conversationId: conversation.id }, orderBy: { capturedAt: 'desc' } })
      : Promise.resolve(null),
    prisma.lead.findFirst({ where: { visitorId: customerId, organizationId }, orderBy: { createdAt: 'desc' } }),
  ]);

  return { visitor, events, sessions, messages, objectionLogs, latestScoreSnapshot, lead };
}

/**
 * Builds a fresh profile from every available signal and persists it as a
 * new row (append-only, mirroring the existing CustomerDNA history
 * convention) — the module's primary entry point, backing
 * POST /api/customer-dna/analyze.
 */
export async function analyzeCustomer({ organizationId, sessionId, customerId }) {
  const raw = await gatherRawData({ organizationId, sessionId, customerId });
  const carryForward = await memoryManager.getCarryForwardContext({ organizationId, customerId });

  const profile = await buildProfile({
    sessionId,
    customerId,
    events: raw.events,
    sessions: raw.sessions,
    messages: raw.messages,
    objectionLogs: raw.objectionLogs,
    lead: raw.lead,
    visitor: raw.visitor,
    latestScoreSnapshot: raw.latestScoreSnapshot,
    carryForward,
  });

  return memoryManager.createProfile({ organizationId, ...profile });
}

/** Backs GET /api/customer-dna/:sessionId. */
export async function getProfile({ organizationId, sessionId }) {
  const profile = await memoryManager.getLatestBySession({ organizationId, sessionId });
  if (!profile) throw AppError.notFound('No Customer DNA profile found for this session');
  return profile;
}

// Fields a human (sales rep) may reasonably correct by hand — deliberately
// excludes computed scores/grades, which only analyzeCustomer should set,
// so a manual edit can never silently desync from the data that produced it.
const MANUALLY_EDITABLE_FIELDS = ['personality', 'communicationStyle', 'preferredLanguage', 'budgetLevel', 'companySize', 'industry', 'nextBestAction', 'conversationSummary'];

/** Backs PUT /api/customer-dna/update — a manual, partial correction, not a re-analysis. */
export async function updateProfile({ organizationId, sessionId, patch }) {
  const fields = Object.fromEntries(Object.entries(patch).filter(([key]) => MANUALLY_EDITABLE_FIELDS.includes(key)));
  if (Object.keys(fields).length === 0) {
    throw AppError.badRequest(`No editable fields provided. Editable fields: ${MANUALLY_EDITABLE_FIELDS.join(', ')}`);
  }

  const updated = await memoryManager.updateLatestProfile({ organizationId, sessionId, patch: fields });
  if (!updated) throw AppError.notFound('No Customer DNA profile found for this session');
  return updated;
}

/** Backs GET /api/customer-dna/dashboard. */
export async function getDashboard({ organizationId }) {
  return memoryManager.getDashboardAggregate({ organizationId });
}
