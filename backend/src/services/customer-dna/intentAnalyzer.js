import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { chatModel } from '../../config/gemini.js';
import { intentExtractionSchema } from './intentExtractionSchema.js';
import { PAIN_POINT_KEYWORDS, BUDGET_KEYWORDS, OBJECTION_KEYWORD_MAP } from './scoringConfig.js';
import { average, extractCurrencyAmount, uniqueInOrder, splitSentences } from './utils.js';
import { logger } from '../../utils/logger.js';

const structuredIntentModel = chatModel.withStructuredOutput(intentExtractionSchema, { name: 'conversation_intent_signals' });

const INTENT_SYSTEM_PROMPT =
  "You read a B2B sales voice call transcript, in whatever language the visitor spoke, and extract pain points and objections they raised. " +
  "Never translate pain points into English — quote the visitor's own words/language exactly. Be conservative: never invent content that was not said.";

const BUYING_SIGNAL_PHRASES = [
  'sign up',
  'get started',
  'next step',
  'move forward',
  'when can we start',
  'how do we begin',
  'send me a contract',
  'send over the details',
  "let's do it",
  'ready to go',
];

function extractQuestions(visitorMessages) {
  return visitorMessages.flatMap((m) => splitSentences(m.content)).filter((sentence) => sentence.trim().endsWith('?'));
}

// English-only substring matching — kept only as a safety net for when the
// LLM extraction call itself fails (rate limit, outage). Real calls in other
// languages (e.g. Hindi) will under-detect here, but a degraded heuristic
// result is better than silently dropping the field.
function extractPainPointsHeuristic(visitorMessages) {
  const matches = [];
  for (const message of visitorMessages) {
    const lowerContent = message.content.toLowerCase();
    for (const keyword of PAIN_POINT_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        matches.push(message.content.trim());
        break;
      }
    }
  }
  return uniqueInOrder(matches).slice(0, 10);
}

// Primary path: language-agnostic LLM extraction of pain points + a fallback
// objection read, from the raw visitor transcript. Falls back to the keyword
// heuristics above (painPoints only — objections keeps its own existing
// fallback chain in analyzeConversation) if the call errors.
async function extractIntentSignalsWithLlm(visitorMessages) {
  const transcript = visitorMessages.map((m) => m.content).join('\n');
  const structured = await structuredIntentModel.invoke([new SystemMessage(INTENT_SYSTEM_PROMPT), new HumanMessage(transcript)]);
  return { painPoints: uniqueInOrder(structured.painPoints).slice(0, 10), objections: structured.objections };
}

function detectBudgetMention(visitorMessages) {
  for (const message of visitorMessages) {
    const lowerContent = message.content.toLowerCase();
    const amount = extractCurrencyAmount(message.content);
    const hasBudgetKeyword = BUDGET_KEYWORDS.some((keyword) => lowerContent.includes(keyword));
    if (amount != null || hasBudgetKeyword) {
      return { mentioned: true, amount, quote: message.content.trim() };
    }
  }
  return { mentioned: false, amount: null, quote: null };
}

function extractBuyingSignals(visitorMessages) {
  const signals = [];
  for (const message of visitorMessages) {
    const lowerContent = message.content.toLowerCase();
    for (const phrase of BUYING_SIGNAL_PHRASES) {
      if (lowerContent.includes(phrase)) signals.push(phrase);
    }
  }
  return uniqueInOrder(signals);
}

// Objections: the voice pipeline's own conversation brain (ai/conversationBrain)
// already detects and types objections in real time, persisted as ObjectionLog
// rows — that structured signal is always preferred. Keyword matching only
// covers the (rare) case where no ObjectionLog rows exist yet for this
// customer, so this analyzer never leaves objections empty on a short call.
function fallbackObjectionsFromKeywordsHeuristic(visitorMessages) {
  const found = new Set();
  for (const message of visitorMessages) {
    const lowerContent = message.content.toLowerCase();
    for (const [type, phrases] of Object.entries(OBJECTION_KEYWORD_MAP)) {
      if (phrases.some((phrase) => lowerContent.includes(phrase))) found.add(type);
    }
  }
  return [...found];
}

/**
 * Conversation transcript (Message[]) + structured objection log
 * (ObjectionLog[]) in, a structured intent/conversation profile out. Async
 * (unlike the rest of this module's pure analyzers) because pain-point/
 * fallback-objection extraction is now an LLM call — see
 * extractIntentSignalsWithLlm — so it works regardless of the visitor's
 * language, not just English keyword substrings.
 */
export async function analyzeConversation({ messages, objectionLogs = [] }) {
  const visitorMessages = messages.filter((m) => m.role === 'VISITOR');
  const aiMessages = messages.filter((m) => m.role === 'AI');

  const questions = extractQuestions(visitorMessages);
  const budget = detectBudgetMention(visitorMessages);
  const buyingSignals = extractBuyingSignals(visitorMessages);

  let painPoints = [];
  let llmObjections = null;
  if (visitorMessages.length > 0) {
    try {
      const extracted = await extractIntentSignalsWithLlm(visitorMessages);
      painPoints = extracted.painPoints;
      llmObjections = extracted.objections;
    } catch (err) {
      logger.error({ err }, 'LLM-based pain point/objection extraction failed, falling back to English-keyword heuristic');
      painPoints = extractPainPointsHeuristic(visitorMessages);
    }
  }

  const objections =
    objectionLogs.length > 0
      ? uniqueInOrder(objectionLogs.map((o) => o.type))
      : llmObjections ?? fallbackObjectionsFromKeywordsHeuristic(visitorMessages);

  // Message.sentimentScore is populated per-turn by the conversation brain's
  // own structured LLM output during the live call — reused directly here
  // rather than re-scored, so this module never spends a second LLM call
  // computing something the voice pipeline already produced.
  const sentimentScores = aiMessages.map((m) => m.sentimentScore).filter((s) => typeof s === 'number');
  const sentiment = sentimentScores.length > 0 ? average(sentimentScores) : 0;

  return {
    questionsAsked: questions.length,
    questions: questions.slice(0, 20),
    budgetMentioned: budget.mentioned,
    budgetQuote: budget.quote,
    budgetAmountUsd: budget.amount,
    painPoints,
    objections,
    explicitBuyingSignals: buyingSignals,
    sentiment, // -1..1
    messageCount: messages.length,
    visitorMessageCount: visitorMessages.length,
  };
}
