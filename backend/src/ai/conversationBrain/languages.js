// Per-language Vapi overrides. Voice IDs are Vapi's own built-in "vapi"
// provider voices (confirmed via live GET /assistant — no ElevenLabs
// dependency); Neha is used for Hindi based on Vapi's naming convention for
// its Indian-locale voice (Elliot/Kylie/etc. are English-locale voices) —
// there's no per-voice language metadata exposed by the API to confirm this
// programmatically, so this should be spot-checked against a real Hindi call.
// Soniox transcriber accepts `language`/`languages` per-call (confirmed via a
// live POST /call/web override, even though @vapi-ai/web's shipped type
// definitions don't list Soniox at all — the REST API accepts it regardless).
export const SUPPORTED_LANGUAGES = ['en', 'hi'];
export const DEFAULT_LANGUAGE = 'en';

const LANGUAGE_CONFIG = {
  en: {
    voiceId: 'Elliot',
    transcriberLanguage: 'en',
    transcriberLanguages: ['en'],
    promptInstruction: 'Speak and respond ONLY in English, regardless of what language the visitor uses.',
  },
  hi: {
    voiceId: 'Neha',
    transcriberLanguage: 'hi',
    transcriberLanguages: ['hi', 'en'],
    promptInstruction:
      'Speak and respond naturally in conversational Hindi (as a native Hindi speaker would on a sales call — natural code-mixing with common English business terms like "meeting", "budget", "demo" is fine and expected, not an error). If the visitor speaks English, still reply in Hindi unless they explicitly ask you to switch.',
  },
};

export function resolveLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

export function getLanguageConfig(language) {
  return LANGUAGE_CONFIG[resolveLanguage(language)];
}
