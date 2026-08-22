import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, PhoneOff, TrendingUp, ShieldCheck, Target, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useVoiceCall } from '../hooks/useVoiceCall.js';
import { useConversationStore } from '../store/conversationStore.js';
import { getVisitor } from '../services/visitorService.js';
import { getErrorMessage } from '../utils/errors.js';
import { toast } from '../store/toastStore.js';
import Waveform from '../components/voice/Waveform.jsx';
import LiveTranscript from '../components/voice/LiveTranscript.jsx';
import LanguageSelect from '../components/voice/LanguageSelect.jsx';
import VoiceStatusIndicator from '../components/voice/VoiceStatusIndicator.jsx';
import AIAvatar from '../components/voice/AIAvatar.jsx';
import CallDuration from '../components/voice/CallDuration.jsx';
import { getSelectedLanguage, setSelectedLanguage } from '../services/voice/languagePreference.js';
import DnaPanel from '../components/dna/DnaPanel.jsx';
import ScoreMeter from '../components/common/ScoreMeter.jsx';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function ConversationPage() {
  const { visitorId } = useParams();
  const navigate = useNavigate();
  const { start, end, disconnect, voiceSocketRef } = useVoiceCall();
  const { status, transcript, scores, objections, liveDna, detectedSignals, voiceStatus, callStartedAt, errorMessage, reset } = useConversationStore();
  const [visitor, setVisitor] = useState(null);
  const [dna, setDna] = useState(null);
  const [visitorLoading, setVisitorLoading] = useState(Boolean(visitorId));
  const [language, setLanguage] = useState(getSelectedLanguage);

  useEffect(() => {
    if (visitorId) {
      setVisitorLoading(true);
      getVisitor(visitorId)
        .then((data) => {
          setVisitor(data.visitor);
          setDna(data.customerDNA);
        })
        // Non-blocking: the voice call still works without visitor context
        // (falls back to a "Demo conversation" header), so a failed profile
        // fetch surfaces as a toast rather than stalling the whole page.
        .catch((err) => toast.error(getErrorMessage(err, 'Failed to load visitor profile.')))
        .finally(() => setVisitorLoading(false));
    }
    return () => {
      disconnect();
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorId]);

  const handleStart = () => start(visitorId);

  const handleEnd = () => {
    if (status === 'active') end();
    else disconnect();
  };

  const canChangeLanguage = status === 'idle' || status === 'ended' || status === 'error';
  const handleLanguageChange = (next) => {
    setLanguage(next);
    setSelectedLanguage(next);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <GlassCard className="flex min-h-[70vh] flex-col">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {visitorLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <div>
              <h2 className="font-serif text-base font-medium text-ink">{visitor?.name ?? (visitorId ? 'Visitor' : 'Demo conversation')}</h2>
              <p className="text-xs text-ink-faint">{visitor?.company ?? 'AI Sales Consultant preview'}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <CallDuration startedAt={callStartedAt} />
            <LanguageSelect value={language} onChange={handleLanguageChange} disabled={!canChangeLanguage} />
            <VoiceStatusIndicator voiceStatus={voiceStatus} />
            <StatusBadge status={status} />
          </div>
        </div>

        <ErrorBanner message={errorMessage} />

        {/* Quick Live HUD banner during active conversation */}
        {status === 'active' && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-bronze/25 bg-bronze/[0.07] px-4 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold text-ink">
                {scores.isHighLead ? '🔥 High-Intent Lead Customer' : scores.leadLabel || 'Live Turn Intelligence'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-ink-2">
              <span>Interest: <strong className="text-bronze">{scores.interestScore}%</strong></span>
              <span>Trust: <strong className="text-emerald-400">{scores.trustScore}%</strong></span>
              <span>Buy Prob: <strong className="text-blue-400">{scores.buyingProbability}%</strong></span>
            </div>
          </div>
        )}

        {status === 'ended' && (
          <motion.div
            className="mb-4 flex items-center gap-2 rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Conversation ended. Start a new one anytime, or head back to the dashboard.</span>
          </motion.div>
        )}

        <div className="flex justify-center py-2">
          <AIAvatar voiceStatus={status === 'active' ? voiceStatus : 'idle'} />
        </div>

        <Waveform voiceSocketRef={voiceSocketRef} />

        <div className="my-4 max-h-[380px] min-h-[180px] flex-1 overflow-hidden rounded-xl2 border border-line bg-bg-alt/40 p-4">
          <LiveTranscript transcript={transcript} />
        </div>

        <div className="flex items-center justify-center gap-3">
          {status === 'idle' || status === 'ended' || status === 'error' ? (
            <Button onClick={handleStart} className="px-6 py-3 text-base">
              <Mic className="h-4 w-4" />
              Talk to AI Sales Consultant
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handleEnd}
              className="border-critical/30 px-6 py-3 text-base text-critical hover:bg-critical/10"
            >
              {status === 'connecting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneOff className="h-4 w-4" />}
              {status === 'connecting' ? 'Cancel' : 'End call'}
            </Button>
          )}
        </div>
      </GlassCard>

      <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 card-title">
              <TrendingUp className="h-4 w-4 text-bronze" />
              Live signals
            </h3>
            {status === 'active' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Analysis
              </span>
            )}
          </div>

          {/* Real-time Lead Qualification Highlight */}
          {scores.isHighLead ? (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent p-3 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)] animate-pulse">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">🔥 High-Value Lead Customer</span>
              </div>
              <Badge tone="accent">{scores.leadGrade || 'A+'} Grade</Badge>
            </div>
          ) : scores.intentTier === 'QUALIFIED' ? (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-xs font-semibold text-blue-300">⭐ Qualified Prospect</span>
              </div>
              <Badge tone="accent">{scores.leadGrade || 'B'} Grade</Badge>
            </div>
          ) : status === 'active' ? (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-line bg-bg-alt/40 p-2.5">
              <span className="text-xs font-medium text-ink-faint">{scores.leadLabel || '🔍 Analyzing intent...'}</span>
              <Badge tone="neutral">{scores.leadGrade || 'C'}</Badge>
            </div>
          ) : null}

          <div className="flex flex-col gap-5">
            <ScoreMeter label="Interest score" value={scores.interestScore} icon={TrendingUp} />
            <ScoreMeter label="Trust score" value={scores.trustScore} icon={ShieldCheck} />
            <ScoreMeter label="Buying probability" value={scores.buyingProbability} icon={Target} />
          </div>

          {detectedSignals?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-line">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Live Intent Signals</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {detectedSignals.map((sig, i) => (
                  <span key={i} className="inline-flex items-center rounded-md bg-bronze/10 border border-bronze/20 px-2 py-0.5 text-[11px] font-medium text-bronze capitalize">
                    ⚡ {sig}
                  </span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {objections.length > 0 && (
          <GlassCard>
            <h3 className="mb-4 flex items-center gap-2 card-title">
              <AlertCircle className="h-4 w-4 text-warning" />
              Objections ({objections.length})
            </h3>
            <div className="flex flex-col gap-2">
              {objections.map((o, i) => (
                <div key={i} className="rounded-lg border border-line bg-bg-alt/40 p-2.5 text-xs">
                  <Badge tone="warning">{o.type}</Badge>
                  <p className="mt-1.5 text-ink-faint">{o.detail}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="card-title">Customer DNA</h3>
            {status === 'active' && liveDna && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-bronze">Live Evolving</span>
            )}
          </div>
          <DnaPanel dna={liveDna || dna} />
        </GlassCard>

        {visitorId && (
          <Button variant="ghost" onClick={() => navigate(`/app/visitors/${visitorId}`)} className="justify-center">
            View full visitor profile
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    idle: { tone: 'neutral', label: 'Ready' },
    connecting: { tone: 'accent', label: 'Connecting…' },
    active: { tone: 'good', label: 'Live' },
    ended: { tone: 'good', label: 'Conversation ended' },
    error: { tone: 'critical', label: 'Error' },
  };
  const { tone, label } = map[status] ?? map.idle;
  return (
    <Badge tone={tone} dot={status === 'active'}>
      {label}
    </Badge>
  );
}
