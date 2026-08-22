import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { chatModel } from '../../config/gemini.js';
import { salesReportSchema } from './reportSchema.js';
import { buildReportPrompt } from './prompts.js';
import { prisma } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

const structuredModel = chatModel.withStructuredOutput(salesReportSchema, { name: 'sales_report' });

const SYSTEM_PROMPT =
  'You are a sales operations analyst producing structured, actionable post-call reports for a B2B sales team. Be honest about weaknesses in the call, not just positive.';

export async function generateReport(conversationId) {
  const conversation = await prisma.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    include: { visitor: true },
  });

  const [messages, latestSnapshot, latestDna, objections] = await Promise.all([
    prisma.message.findMany({ where: { conversationId }, orderBy: { sequence: 'asc' } }),
    prisma.conversationScoreSnapshot.findFirst({ where: { conversationId }, orderBy: { capturedAt: 'desc' } }),
    prisma.customerDNA.findFirst({ where: { visitorId: conversation.visitorId }, orderBy: { version: 'desc' } }),
    prisma.objectionLog.findMany({ where: { conversationId } }),
  ]);

  const finalScores = latestSnapshot ?? { interestScore: 0, trustScore: 0, buyingProbability: 0 };

  const prompt = buildReportPrompt({ conversation, messages, dna: latestDna, finalScores, objections });

  let structured;
  try {
    structured = await structuredModel.invoke([new SystemMessage(SYSTEM_PROMPT), new HumanMessage(prompt)]);
  } catch (err) {
    logger.error({ err, conversationId }, 'Report generation failed');
    throw err;
  }

  return prisma.report.upsert({
    where: { conversationId },
    create: {
      conversationId,
      transcriptSummary: structured.transcriptSummary,
      salesPerformanceScore: structured.salesPerformanceScore,
      buyingProbability: structured.buyingProbability,
      dnaSnapshot: latestDna ?? {},
      recommendations: structured.recommendations,
      missedOpportunities: structured.missedOpportunities,
      suggestedFollowUp: structured.suggestedFollowUp,
      crmSummary: structured.crmSummary,
    },
    update: {
      transcriptSummary: structured.transcriptSummary,
      salesPerformanceScore: structured.salesPerformanceScore,
      buyingProbability: structured.buyingProbability,
      dnaSnapshot: latestDna ?? {},
      recommendations: structured.recommendations,
      missedOpportunities: structured.missedOpportunities,
      suggestedFollowUp: structured.suggestedFollowUp,
      crmSummary: structured.crmSummary,
      generatedAt: new Date(),
    },
  });
}
