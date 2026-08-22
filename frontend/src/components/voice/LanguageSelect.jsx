import { Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../services/voice/languagePreference.js';
import './LanguageSelect.css';

// Self-contained styling (not Tailwind utility classes, not the marketing
// site's CSS-variable system) so this one component drops cleanly into both
// the Tailwind-based dashboard (ConversationPage.jsx) and the plain-CSS
// public site (AIConsultant.jsx) without fighting either design system.
export default function LanguageSelect({ value, onChange, disabled }) {
  return (
    <label className="voice-language-select">
      <Languages size={14} className="voice-language-select__icon" />
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Voice call language"
        data-icon-select
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
