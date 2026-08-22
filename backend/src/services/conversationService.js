import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { generateReport } from '../ai/reportGenerator/reportGenerator.js';
import { analyzeCustomer } from './customer-dna/index.js';
import { regenerateDnaAfterConversation } from './behavior/dnaOrchestrationService.js';
import { loadConversationContext, DEFAULT_SCORES } from '../ai/conversationBrain/brain.js';
import { buildSystemPrompt } from '../ai/conversationBrain/prompts.js';
import { resolveLanguage, getLanguageConfig } from '../ai/conversationBrain/languages.js';
import { getAssistant } from '../config/vapi.js';
import { logger } from '../utils/logger.js';

// V2 Phase 1 voice-bot stability fix — root cause, not a re-hardcode: the
// system prompt override below MUST repeat the assistant's model
// provider/model (Vapi's AssistantOverrides.model is a discriminated union
// keyed on provider), and hardcoding that pair previously went stale the
// moment someone changed the model on Vapi's dashboard directly — every
// call then silently used a provider/credential pairing Vapi couldn't route,
// so no AI reply was ever generated even though the call connected fine
// (this exact failure mode is documented in git history/comments below).
// Fetching it from Vapi itself eliminates the class of bug rather than
// fixing today's snapshot value again. Cached briefly since this is called
// on every conversation start and must never add meaningful latency to
// "voice session starts" — falls back to the last-known-good pairing (never
// throws) so a transient Vapi API hiccup can't block a call from starting.
const ASSISTANT_MODEL_CACHE_TTL_MS = 10 * 60 * 1000;
let assistantModelCache = { provider: 'anthropic', model: 'claude-sonnet-4-6', fetchedAt: 0 };

async function getAssistantModelConfig() {
  const isFresh = Date.now() - assistantModelCache.fetchedAt < ASSISTANT_MODEL_CACHE_TTL_MS;
  if (isFresh) return assistantModelCache;

  try {
    const assistant = await getAssistant();
    if (assistant?.model?.provider && assistant?.model?.model) {
      assistantModelCache = { provider: assistant.model.provider, model: assistant.model.model, fetchedAt: Date.now() };
    }
  } catch (err) {
    logger.error({ err }, 'Failed to fetch live Vapi assistant model config, using last-known-good pairing');
  }

  return assistantModelCache;
}

export async function startConversation({ organizationId, visitorId, sessionId, language }) {
  const visitor = await prisma.visitor.findFirst({ where: { id: visitorId, organizationId } });
  if (!visitor) throw AppError.notFound('Visitor not found');

  const resolvedLanguage = resolveLanguage(language);
  const languageConfig = getLanguageConfig(resolvedLanguage);

  const conversation = await prisma.conversation.create({
    data: { organizationId, visitorId, sessionId, status: 'ACTIVE', channel: 'VOICE' },
  });

  const { behaviorSummary, latestDna, lead } = await loadConversationContext(conversation.id);
  const liveScores = { ...DEFAULT_SCORES, interestScore: behaviorSummary.interestScore };
  const systemPrompt = buildSystemPrompt({ visitor, behaviorSummary, dna: latestDna, liveScores, lead, language: resolvedLanguage });
  const assistantModel = await getAssistantModelConfig();

  return {
    conversation,
    vapiPublicKey: env.VAPI_PUBLIC_KEY,
    assistantId: env.VAPI_ASSISTANT_ID,
    assistantOverrides: {
      // provider+model repeated here (not just messages) because Vapi's
      // AssistantOverrides.model is a discriminated union keyed on
      // `provider` — omitting it risks the override being rejected or
      // merged ambiguously rather than cleanly replacing the system prompt.
      // Fetched live from Vapi (see getAssistantModelConfig above) rather
      // than hardcoded, so this can never again silently drift from
      // whatever model is actually configured on the assistant.
      model: { provider: assistantModel.provider, model: assistantModel.model, messages: [{ role: 'system', content: systemPrompt }] },
      // Model-generated rather than the assistant's static configured
      // firstMessage (confirmed live via GET /assistant/{id}: a bare
      // "Hello.", unrelated to any of the visitor context this system
      // prompt builds) — the assistant now opens using the same
      // behavior/DNA/lead-aware system prompt as the rest of the call,
      // instead of a generic greeting that reads as broken/scripted.
      firstMessageMode: 'assistant-speaks-first-with-model-generated-message',
      // Soniox transcriber's language/languages ARE overridable per-call —
      // confirmed via a live POST /call/web test, even though @vapi-ai/web's
      // shipped .d.ts doesn't list Soniox in its AssistantOverrides union
      // (stale types; Vapi's actual REST API accepts it regardless).
      transcriber: { provider: 'soniox', model: 'stt-rt-v5', language: languageConfig.transcriberLanguage, languages: languageConfig.transcriberLanguages },
      voice: { provider: 'vapi', voiceId: languageConfig.voiceId },
      // Lower waitSeconds = the assistant starts speaking sooner after the
      // visitor stops (default 0.4s). Lower stopSpeakingPlan thresholds =
      // the assistant yields the mic almost as soon as the visitor starts
      // talking over it, instead of finishing its sentence first. Both
      // confirmed as valid live-overridable fields via StartSpeakingPlan/
      // StopSpeakingPlan in @vapi-ai/web's type definitions.
      startSpeakingPlan: { waitSeconds: 0.3 },
      stopSpeakingPlan: { numWords: 0, voiceSeconds: 0.1, backoffSeconds: 0.5 },
      metadata: { conversationId: conversation.id, organizationId, visitorId, language: resolvedLanguage },
    },
  };
}

const DEMO_FINGERPRINT = 'dashboard-demo-visitor';

// The public /conversations/start endpoint is for the embeddable website
// widget (API-key authenticated, real anonymous visitors). A logged-in sales
// rep previewing or resuming a conversation from the dashboard has no API
// key in the browser and no visitor session of their own — this lets them
// start a call against any already-tracked visitor, or a standing "demo"
// visitor when no specific lead is being previewed.
export async function startConversationForDashboard({ organizationId, visitorId, language }) {
  const visitor = visitorId
    ? await prisma.visitor.findFirst({ where: { id: visitorId, organizationId } })
    : await prisma.visitor.upsert({
        where: { organizationId_fingerprint: { organizationId, fingerprint: DEMO_FINGERPRINT } },
        update: {},
        create: {
          organizationId,
          fingerprint: DEMO_FINGERPRINT,
          name: 'Demo Visitor',
          company: 'Preview Session',
        },
      });

  if (!visitor) throw AppError.notFound('Visitor not found');

  return startConversation({ organizationId, visitorId: visitor.id, language });
}

export async function endConversation({ organizationId, conversationId, status = 'ENDED' }) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, organizationId } });
  if (!conversation) throw AppError.notFound('Conversation not found');

  if (conversation.status !== 'ACTIVE') {
    return conversation;
  }

  const endedAt = new Date();
  const durationSeconds = Math.round((endedAt.getTime() - conversation.startedAt.getTime()) / 1000);

  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: { status, endedAt, durationSeconds },
  });

  // Fire-and-forget: the visitor's "hang up" action (REST call or socket
  // disconnect) should resolve immediately rather than block on an LLM call.
  // The dashboard's report endpoint returns 404 "not yet generated" until
  // this finishes, which the frontend renders as a brief generating state.
  generateReport(conversationId).catch((err) => {
    logger.error({ err, conversationId }, 'Failed to auto-generate report on conversation end');
  });

  // V2: same Customer DNA regeneration as the Vapi webhook path (see
  // vapiWebhookService.js) — this function is the OTHER way a conversation
  // ends (dashboard-initiated manual end, and the stale-conversation
  // sweeper), so it needs the same trigger to keep DNA profiles current
  // regardless of which path actually closed out the call.
  analyzeCustomer({
    organizationId,
    sessionId: conversation.sessionId ?? conversation.id,
    customerId: conversation.visitorId,
  }).catch((err) => {
    logger.error({ err, conversationId }, 'Failed to regenerate Customer DNA profile on conversation end');
  });

  // Separate from the deterministic profile above: this is the LLM-based
  // qualitative CustomerDNA version history that the visitor detail page
  // renders (frontend/src/pages/VisitorDetailPage.jsx) — it previously only
  // regenerated from website event ingestion, so it never picked up what
  // was actually said on a voice call.
  regenerateDnaAfterConversation({ organizationId, visitorId: conversation.visitorId }).catch((err) => {
    logger.error({ err, conversationId }, 'Failed to regenerate qualitative Customer DNA on conversation end');
  });

  return updated;
}
