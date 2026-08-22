import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { prisma } from '../../config/db.js';
import { chatModel } from '../../config/gemini.js';
import { finalCallExtractionSchema } from '../../ai/conversationBrain/finalCallSchema.js';
import { generateReport } from '../../ai/reportGenerator/reportGenerator.js';
import { upsertLeadCapture } from '../leadService.js';
import { analyzeCustomer } from '../customer-dna/index.js';
import { regenerateDnaAfterConversation } from '../behavior/dnaOrchestrationService.js';
import { logger } from '../../utils/logger.js';

const structuredModel = chatModel.withStructuredOutput(finalCallExtractionSchema, { name: 'final_call_extraction' });

const EXTRACTION_SYSTEM_PROMPT =
  'You are analyzing the full transcript of a completed B2B sales voice call. Read it end to end ' +
  'and extract the FINAL state — overall scores as of the end of the call (not deltas), every ' +
  'objection raised anywhere in the call, and every lead-qualification fact the visitor volunteered.';

// Vapi's transcript entries use varying role labels depending on API version;
// normalize defensively rather than assume one exact set of strings. Returns
// null for roles that aren't actual conversation turns (e.g. tool calls),
// meaning "skip this entry".
function normalizeRole(role) {
  const value = (role ?? '').toLowerCase();
  if (['system'].includes(value)) return 'SYSTEM';
  if (['bot', 'assistant', 'ai'].includes(value)) return 'AI';
  if (['user', 'visitor', 'human'].includes(value)) return 'VISITOR';
  return null;
}

function extractConversationId(message) {
  return message.call?.metadata?.conversationId ?? message.assistant?.metadata?.conversationId ?? null;
}

async function persistTranscriptMessages(conversationId, artifactMessages) {
  const turns = (artifactMessages ?? [])
    .map((entry) => ({ role: normalizeRole(entry.role), content: entry.message ?? entry.content ?? '' }))
    .filter((entry) => entry.role && entry.role !== 'SYSTEM' && entry.content.trim().length > 0);

  if (turns.length === 0) return [];

  await prisma.$transaction(
    turns.map((turn, index) =>
      prisma.message.create({
        data: { conversationId, sequence: index + 1, role: turn.role, content: turn.content },
      })
    )
  );

  return turns;
}

function buildTranscriptText(turns) {
  return turns.map((turn) => `${turn.role === 'AI' ? 'Sales consultant' : 'Visitor'}: ${turn.content}`).join('\n');
}

async function handleEndOfCallReport(message) {
  const conversationId = extractConversationId(message);
  if (!conversationId) {
    logger.error({ callId: message.call?.id }, 'Vapi end-of-call-report missing conversationId in call metadata');
    return;
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) {
    logger.error({ conversationId, callId: message.call?.id }, 'Vapi end-of-call-report references unknown conversation');
    return;
  }

  // Idempotency guard: Vapi may retry a webhook delivery. Once we've already
  // marked this conversation ENDED we've already done all the work below.
  if (conversation.status === 'ENDED') {
    logger.info({ conversationId }, 'Vapi end-of-call-report for an already-ended conversation, skipping');
    return;
  }

  const existingMessages = await prisma.message.findMany({ where: { conversationId }, orderBy: { sequence: 'asc' } });
  const turns =
    existingMessages.length > 0
      ? existingMessages.map((m) => ({ role: m.role, content: m.content }))
      : await persistTranscriptMessages(conversationId, message.artifact?.messages);

  const transcriptText = buildTranscriptText(turns);

  let extraction = null;
  if (transcriptText.trim().length > 0) {
    try {
      extraction = await structuredModel.invoke([
        new SystemMessage(EXTRACTION_SYSTEM_PROMPT),
        new HumanMessage(transcriptText),
      ]);
    } catch (err) {
      logger.error({ err, conversationId }, 'Final call extraction failed');
    }
  }

  const endedAt = message.endedAt ? new Date(message.endedAt) : new Date();
  const startedAt = message.startedAt ? new Date(message.startedAt) : conversation.startedAt;
  const durationSeconds = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));

  const finalScores = extraction
    ? {
        interestScore: extraction.interestScore,
        trustScore: extraction.trustScore,
        buyingProbability: extraction.buyingProbability,
      }
    : { interestScore: 0, trustScore: 0, buyingProbability: 0 };

  await prisma.$transaction([
    prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'ENDED', endedAt, durationSeconds, vapiCallId: message.call?.id ?? conversation.vapiCallId },
    }),
    ...(extraction
      ? [
          prisma.conversationScoreSnapshot.create({
            data: {
              conversationId,
              ...finalScores,
              sentimentScore: extraction.sentimentScore,
              objectionCount: extraction.objections.length,
            },
          }),
          ...extraction.objections.map((objection) =>
            prisma.objectionLog.create({
              data: { conversationId, type: objection.type, detail: objection.detail },
            })
          ),
        ]
      : []),
  ]);

  if (extraction) {
    await upsertLeadCapture({
      conversationId,
      organizationId: conversation.organizationId,
      visitorId: conversation.visitorId,
      leadCapture: extraction.leadCapture,
      scores: finalScores,
    });
  }

  try {
    await generateReport(conversationId);
  } catch (err) {
    logger.error({ err, conversationId }, 'Failed to generate report after Vapi call ended');
  }

  // V2: Customer DNA Engine profile, regenerated after every completed call
  // so it reflects this conversation's transcript/scores/objections —
  // previously only triggered from behavior-event ingestion, never from a
  // finished call, so a visitor's DNA profile could go stale the moment
  // they actually talked to the AI. Awaited inline (like generateReport
  // above) rather than fire-and-forget, since this handler's response time
  // already tolerates LLM latency and a profile visible on the dashboard
  // immediately after the call ends is worth that cost.
  try {
    await analyzeCustomer({
      organizationId: conversation.organizationId,
      sessionId: conversation.sessionId ?? conversation.id,
      customerId: conversation.visitorId,
    });
  } catch (err) {
    logger.error({ err, conversationId }, 'Failed to regenerate Customer DNA profile after Vapi call ended');
  }

  // Separate from the profile above: the versioned qualitative CustomerDNA
  // history that the visitor detail page actually reads
  // (frontend/src/pages/VisitorDetailPage.jsx via GET /visitors/:id).
  // Awaited for the same reason as the two calls above.
  try {
    await regenerateDnaAfterConversation({ organizationId: conversation.organizationId, visitorId: conversation.visitorId });
  } catch (err) {
    logger.error({ err, conversationId }, 'Failed to regenerate qualitative Customer DNA after Vapi call ended');
  }

  logger.info({ conversationId, callId: message.call?.id, turns: turns.length }, 'Vapi end-of-call-report processed');
}

async function handleStatusUpdate(message) {
  const conversationId = extractConversationId(message);
  if (!conversationId) return;

  // Only "in-progress" is actionable here — conversations are already created
  // ACTIVE at call-start time, and "ended" is handled authoritatively by
  // end-of-call-report (which also runs the report/lead pipeline that a bare
  // status flip here can't).
  if (message.status === 'in-progress') {
    await prisma.conversation
      .updateMany({ where: { id: conversationId, status: { not: 'ACTIVE' } }, data: { status: 'ACTIVE' } })
      .catch((err) => logger.error({ err, conversationId }, 'Failed to sync in-progress status from Vapi'));
  }
}

export async function handleVapiWebhook(payload) {
  const message = payload?.message;
  if (!message?.type) {
    logger.warn({ payload }, 'Vapi webhook payload missing message.type');
    return;
  }

  switch (message.type) {
    case 'end-of-call-report':
      await handleEndOfCallReport(message);
      break;
    case 'status-update':
      await handleStatusUpdate(message);
      break;
    default:
      logger.debug({ type: message.type }, 'Unhandled Vapi webhook event type, ignoring');
  }
}
