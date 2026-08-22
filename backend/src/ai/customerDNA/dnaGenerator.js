import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { chatModel } from '../../config/gemini.js';
import { customerDnaSchema } from './dnaSchema.js';
import { buildDnaGenerationPrompt } from './prompts.js';
import { prisma } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

const structuredModel = chatModel.withStructuredOutput(customerDnaSchema, { name: 'customer_dna' });

const SYSTEM_PROMPT =
  'You analyze website visitor behavior data to produce structured B2B sales intelligence profiles. ' +
  'You are precise, conservative with low-signal data, and never fabricate specifics not implied by the input.';

/**
 * Generates a new qualitative Customer DNA profile from behavior data and
 * persists it as the next version for this visitor (append-only history).
 */
export async function generateCustomerDna({ organizationId, visitor, behaviorSummary }) {
  const messages = [new SystemMessage(SYSTEM_PROMPT), new HumanMessage(buildDnaGenerationPrompt({ visitor, behaviorSummary }))];

  let structured;
  try {
    structured = await structuredModel.invoke(messages);
  } catch (err) {
    logger.error({ err, visitorId: visitor.id }, 'Customer DNA generation failed, falling back to heuristic defaults');
    structured = fallbackDna(behaviorSummary);
  }

  const latest = await prisma.customerDNA.findFirst({
    where: { visitorId: visitor.id },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  const dna = await prisma.customerDNA.create({
    data: {
      organizationId,
      visitorId: visitor.id,
      version: (latest?.version ?? 0) + 1,
      interestScore: behaviorSummary.interestScore,
      buyingIntent: structured.buyingIntent,
      budgetSensitivity: structured.budgetSensitivity,
      technicalKnowledge: structured.technicalKnowledge,
      decisionSpeed: structured.decisionSpeed,
      communicationStyle: structured.communicationStyle,
      industry: structured.industry ?? visitor.industry ?? null,
      companySize: structured.companySize,
      likelyObjections: structured.likelyObjections,
      riskLevel: structured.riskLevel,
      personality: structured.personality,
      reasoning: { text: structured.reasoning, behaviorSummary },
    },
  });

  return dna;
}

// Never let a flaky LLM call block the pipeline — degrade to a defensible,
// neutral profile derived purely from the heuristic score.
function fallbackDna(behaviorSummary) {
  const intentByScore =
    behaviorSummary.interestScore >= 75 ? 'VERY_HIGH' : behaviorSummary.interestScore >= 50 ? 'HIGH' : behaviorSummary.interestScore >= 25 ? 'MEDIUM' : 'LOW';

  return {
    buyingIntent: intentByScore,
    budgetSensitivity: 'MEDIUM',
    technicalKnowledge: 'INTERMEDIATE',
    decisionSpeed: 'MODERATE',
    communicationStyle: 'ANALYTICAL',
    industry: null,
    companySize: null,
    likelyObjections: ['OTHER'],
    riskLevel: 'MEDIUM',
    personality: 'insufficient data for a confident read',
    reasoning: 'LLM generation failed; profile derived from heuristic interest score only.',
  };
}
