import { Ear, Brain, Volume2 } from 'lucide-react';
import './VoiceStatusIndicator.css';

const VOICE_STATUS_MAP = {
  listening: { label: 'Listening…', icon: Ear, tone: 'listening' },
  thinking: { label: 'Thinking…', icon: Brain, tone: 'thinking' },
  speaking: { label: 'Speaking…', icon: Volume2, tone: 'speaking' },
};

// Fine-grained voice-activity indicator, distinct from the coarse
// connection-status badge (idle/connecting/active/ended/error) that's
// already rendered separately in ConversationPage.jsx/AIConsultant.jsx —
// this only renders once a call is actually live.
export default function VoiceStatusIndicator({ voiceStatus }) {
  const entry = VOICE_STATUS_MAP[voiceStatus];
  if (!entry) return null;

  const Icon = entry.icon;
  return (
    <div className={`voice-status-indicator voice-status-indicator--${entry.tone}`}>
      <Icon size={14} className="voice-status-indicator__icon" />
      <span>{entry.label}</span>
    </div>
  );
}
