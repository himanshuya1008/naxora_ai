import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { chatModel } from '../../config/gemini.js';
import { conversationTurnSchema } from './brainSchema.js';
import { buildSystemPrompt, CONVERSATION_START_MARKER, CONVERSATION_START_INSTRUCTION } from './prompts.js';
import { prisma } from '../../config/db.js';
import { getBehaviorSummary } from '../../services/behavior/behaviorSummaryService.js';
import { upsertLeadCapture } from '../../services/leadService.js';
import { logger } from '../../utils/logger.js';

const structuredModel = chatModel.withStructuredOutput(conversationTurnSchema, { name: 'conversation_turn' });

export const DEFAULT_SCORES = { interestScore: 40, trustScore: 50, buyingProbability: 15, objectionCount: 0 };

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export async function loadConversationContext(conversationId) {
  const conversation = await prisma.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    include: { visitor: true },
  });

  const [messages, latestSnapshot, latestDna, lead] = await Promise.all([
    prisma.message.findMany({ where: { conversationId }, orderBy: { sequence: 'asc' } }),
    prisma.conversationScoreSnapshot.findFirst({ where: { conversationId }, orderBy: { capturedAt: 'desc' } }),
    prisma.customerDNA.findFirst({ where: { visitorId: conversation.visitor.id }, orderBy: { version: 'desc' } }),
    prisma.lead.findUnique({ where: { conversationId } }),
  ]);

  const { behaviorSummary } = await getBehaviorSummary(conversation.visitor.id);

  return { conversation, messages, latestSnapshot, latestDna, behaviorSummary, lead };
}

function toLangChainHistory(messages) {
  return messages.map((m) => (m.role === 'AI' ? new AIMessage(m.content) : new HumanMessage(m.content)));
}

/**
 * Processes one conversational turn end-to-end: runs the structured reasoning
 * call, persists the visitor + AI messages, updates the live score snapshot,
 * logs any detected objection, and returns everything the caller (Socket.IO
 * handler) needs to speak the response and broadcast updated analytics.
 *
 * Pass `visitorText: CONVERSATION_START_MARKER` to generate the opening line
 * before the visitor has said anything — every other call is a real transcript.
 */
export async function processTurn({ conversationId, visitorText }) {
  const isOpeningTurn = visitorText === CONVERSATION_START_MARKER;
  const { conversation, messages, latestSnapshot, latestDna, behaviorSummary, lead } = await loadConversationContext(conversationId);

  const liveScores = latestSnapshot
    ? {
        interestScore: latestSnapshot.interestScore,
        trustScore: latestSnapshot.trustScore,
        buyingProbability: latestSnapshot.buyingProbability,
        objectionCount: latestSnapshot.objectionCount,
      }
    : { ...DEFAULT_SCORES, interestScore: behaviorSummary.interestScore };

  const systemPrompt = buildSystemPrompt({ visitor: conversation.visitor, behaviorSummary, dna: latestDna, liveScores, lead });

  const nextSequence = (messages.at(-1)?.sequence ?? 0) + 1;
  let visitorMessage = null;

  if (!isOpeningTurn) {
    visitorMessage = await prisma.message.create({
      data: { conversationId, sequence: nextSequence, role: 'VISITOR', content: visitorText },
    });
  }

  const llmMessages = [
    new SystemMessage(systemPrompt),
    ...toLangChainHistory(messages),
    new HumanMessage(isOpeningTurn ? CONVERSATION_START_INSTRUCTION : visitorText),
  ];

  const turn = await structuredModel.invoke(llmMessages);

  const updatedScores = {
    interestScore: clamp(liveScores.interestScore + turn.interestScoreDelta, 0, 100),
    trustScore: clamp(liveScores.trustScore + turn.trustScoreDelta, 0, 100),
    buyingProbability: clamp(liveScores.buyingProbability + turn.buyingProbabilityDelta, 0, 100),
    objectionCount: liveScores.objectionCount + (turn.objectionDetected ? 1 : 0),
  };

  const aiSequence = (visitorMessage?.sequence ?? nextSequence - 1) + 1;

  const [aiMessage] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        sequence: aiSequence,
        role: 'AI',
        content: turn.response,
        sentimentScore: turn.sentimentScore,
        strategyUsed: turn.strategy,
        predictedObjection: turn.objectionDetected?.type ?? null,
        reasoningTrace: turn,
      },
    }),
    prisma.conversationScoreSnapshot.create({
      data: { conversationId, ...updatedScores, sentimentScore: turn.sentimentScore },
    }),
    prisma.conversation.update({ where: { id: conversationId }, data: { currentStrategy: turn.strategy } }),
    ...(turn.objectionDetected
      ? [
          prisma.objectionLog.create({
            data: {
              conversationId,
              type: turn.objectionDetected.type,
              detail: turn.objectionDetected.detail,
            },
          }),
        ]
      : []),
  ]);

  await upsertLeadCapture({
    conversationId,
    organizationId: conversation.organizationId,
    visitorId: conversation.visitor.id,
    leadCapture: turn.leadCapture,
    scores: updatedScores,
  });

  logger.debug({ conversationId, strategy: turn.strategy }, 'Conversation turn processed');

  return { aiMessage, turn, scores: updatedScores };
}
