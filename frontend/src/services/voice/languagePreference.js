const STORAGE_KEY = 'aisip_voice_language';

export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
];

const DEFAULT_LANGUAGE = 'en';

// Plain localStorage, matching the pattern already used for visitor/session
// identity in services/tracking/behaviorTracker.js — persists until
// explicitly changed, survives reloads and new calls.
export function getSelectedLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.some((l) => l.value === stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function setSelectedLanguage(language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // localStorage unavailable (private browsing, etc.) — the selection
    // just won't persist across reloads; not worth surfacing as an error.
  }
}
