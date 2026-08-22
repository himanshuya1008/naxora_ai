import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, PhoneOff, Loader2, TrendingUp, ShieldCheck, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePublicVoiceCall } from '../../hooks/usePublicVoiceCall.js';
import { useConversationStore } from '../../store/conversationStore.js';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking.js';
import Waveform from '../../components/voice/Waveform.jsx';
import LiveTranscript from '../../components/voice/LiveTranscript.jsx';
import LanguageSelect from '../../components/voice/LanguageSelect.jsx';
import VoiceStatusIndicator from '../../components/voice/VoiceStatusIndicator.jsx';
import AIAvatar from '../../components/voice/AIAvatar.jsx';
import CallDuration from '../../components/voice/CallDuration.jsx';
import StayConnectedModal from '../../components/StayConnectedModal/StayConnectedModal.jsx';
import { getSelectedLanguage, setSelectedLanguage } from '../../services/voice/languagePreference.js';
import ScoreMeter from '../../components/common/ScoreMeter.jsx';
import Badge from '../../components/common/Badge.jsx';
import ErrorBanner from '../../components/common/ErrorBanner.jsx';
import DnaPanel from '../../components/dna/DnaPanel.jsx';
import Hero from '../../components/Hero/Hero.jsx';
import LiveAiOrb from '../../components/illustrations/LiveAiOrb.jsx';
import Button from '../../components/Button/Button.jsx';
import { easeTransition } from '../../animations/variants.js';
import './AIConsultant.css';

const STATUS_MAP = {
  idle: { tone: 'neutral', label: 'Ready' },
  connecting: { tone: 'accent', label: 'Connecting…' },
  active: { tone: 'good', label: 'Live' },
  // 'good' (green), not 'neutral' — a call that finished is a positive
  // outcome, not a dead/idle one; reads as a friendly success state rather
  // than "nothing is happening."
  ended: { tone: 'good', label: 'Conversation ended' },
  error: { tone: 'critical', label: 'Error' },
};

export default function AIConsultant() {
  const [searchParams] = useSearchParams();
  const interestedService = searchParams.get('interestedService');
  const { start, end, disconnect, voiceSocketRef } = usePublicVoiceCall();
  const { status, transcript, scores, objections, liveDna, detectedSignals, voiceStatus, callStartedAt, endedNaturally, errorMessage, reset } = useConversationStore();
  const { trackEvent, getVisitorId, getSessionId } = useBehaviorTracking();
  const [visitorReady, setVisitorReady] = useState(false);
  // Guards against an indefinite "Getting ready…" if visitor-id
  // initialization (BehaviorTrackingProvider's tracker.init(), which hits
  // the backend) fails or never resolves — e.g. a real bug that took this
  // exact shape once already: tracker.init() threw on every call because
  // the DB was missing a column the Prisma client expected, the error was
  // swallowed (by design — tracking must never break the site), and
  // visitorId simply stayed null forever with zero user-facing signal.
  const [visitorInitTimedOut, setVisitorInitTimedOut] = useState(false);
  const [language, setLanguage] = useState(getSelectedLanguage);
  const [showStayConnected, setShowStayConnected] = useState(false);

  // Gated on BOTH flags, not endedNaturally alone: status only becomes
  // 'ended' once Vapi's real call-end event fires (mic/audio stream fully
  // torn down), which is also the same tick vapiCallController.js now sets
  // endedNaturally in (see its call-end handler) — so this only ever opens
  // once the call has completely finished, never while the assistant is
  // still speaking the closing line. Never true for a manual hangup: ending
  // the call via the button resets status straight to 'idle', not 'ended'.
  // Tracked as its own local state (not derived directly in the render) so
  // dismissing it (Skip/Submit/close) doesn't have it instantly reopen
  // while the store's flags are still set for the same finished call.
  useEffect(() => {
    if (status === 'ended' && endedNaturally) setShowStayConnected(true);
  }, [status, endedNaturally]);

  useEffect(() => {
    trackEvent('PAGE_VIEW', { page: '/ai-consultant', metadata: interestedService ? { interestedService } : undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (getVisitorId()) {
      setVisitorReady(true);
      return undefined;
    }

    const POLL_MS = 200;
    const READY_TIMEOUT_MS = 10_000;
    const startedAt = Date.now();

    const interval = setInterval(() => {
      if (getVisitorId()) {
        setVisitorReady(true);
        clearInterval(interval);
        return;
      }
      if (Date.now() - startedAt >= READY_TIMEOUT_MS) {
        clearInterval(interval);
        setVisitorInitTimedOut(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => start({ visitorId: getVisitorId(), sessionId: getSessionId() });

  const handleEnd = () => {
    if (status === 'active') end();
    else disconnect();
  };

  const { tone: statusTone, label: statusLabel } = STATUS_MAP[status] ?? STATUS_MAP.idle;
  const isCallable = status === 'idle' || status === 'ended' || status === 'error';

  const handleLanguageChange = (next) => {
    setLanguage(next);
    setSelectedLanguage(next);
  };

  return (
    <div className="ai-consultant">
      <Hero
        eyebrow="AI Sales Consultant"
        title="Talk with our"
        highlight="AI Sales Consultant"
        subtitle="It already knows what you've been exploring on our site — no generic intro questions, just a real conversation about your business."
        showScrollIndicator={false}
        visual={<LiveAiOrb size={260} />}
      />

      <div className="ai-consultant__layout">
        <motion.div
          className="ai-consultant__panel"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={easeTransition}
        >
          <div className="ai-consultant__panel-head">
            <div>
              <h2 className="ai-consultant__panel-title">AI Sales Consultant</h2>
              <p className="ai-consultant__panel-sub">Live voice conversation</p>
            </div>
            <div className="ai-consultant__panel-head-controls">
              <CallDuration startedAt={callStartedAt} />
              <LanguageSelect value={language} onChange={handleLanguageChange} disabled={!isCallable} />
              <VoiceStatusIndicator voiceStatus={voiceStatus} />
              <Badge tone={statusTone} dot={status === 'active'}>
                {statusLabel}
              </Badge>
            </div>
          </div>

          <ErrorBanner message={errorMessage} />
          <ErrorBanner
            message={
              visitorInitTimedOut
                ? "We couldn't get your session ready. This is usually a temporary connection issue — try again in a moment."
                : null
            }
          />

          {/* Quick Live HUD banner during active conversation */}
          {status === 'active' && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-bronze/25 bg-bronze/[0.07] px-4 py-2.5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold text-ink">
                  {scores.isHighLead ? '🔥 High-Intent Lead' : scores.leadLabel || 'Live Turn Intelligence'}
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
              className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={easeTransition}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Thanks for chatting — start a new conversation anytime.</span>
            </motion.div>
          )}

          <div className="ai-consultant__avatar">
            <AIAvatar voiceStatus={status === 'active' ? voiceStatus : 'idle'} />
          </div>

          <Waveform voiceSocketRef={voiceSocketRef} />

          <div className="ai-consultant__transcript">
            <LiveTranscript transcript={transcript} />
          </div>

          <div className="ai-consultant__controls">
            {visitorInitTimedOut ? (
              <Button onClick={() => window.location.reload()} className="ai-consultant__call-btn">
                <Mic size={16} />
                Retry
              </Button>
            ) : isCallable ? (
              <Button onClick={handleStart} disabled={!visitorReady} className="ai-consultant__call-btn">
                {visitorReady ? <Mic size={16} /> : <Loader2 size={16} className="ai-consultant__spin" />}
                {visitorReady ? 'Talk to AI Sales Consultant' : 'Getting ready…'}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleEnd} className="ai-consultant__end-btn">
                {status === 'connecting' ? <Loader2 size={16} className="ai-consultant__spin" /> : <PhoneOff size={16} />}
                {status === 'connecting' ? 'Cancel' : 'End call'}
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          className="ai-consultant__side"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ ...easeTransition, delay: 0.1 }}
        >
          <div className="ai-consultant__card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="ai-consultant__card-title mb-0">
                <TrendingUp size={16} className="ai-consultant__card-icon" />
                Live signals
              </h3>
              {status === 'active' && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {/* Real-time Lead Qualification Highlight */}
            {scores.isHighLead ? (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent p-3 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)] animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">🔥 High-Value Lead</span>
                </div>
                <Badge tone="accent">{scores.leadGrade || 'A+'} Grade</Badge>
              </div>
            ) : scores.intentTier === 'QUALIFIED' ? (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-xs font-semibold text-blue-300">⭐ Qualified Buyer</span>
                </div>
                <Badge tone="accent">{scores.leadGrade || 'B'} Grade</Badge>
              </div>
            ) : status === 'active' ? (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-line bg-bg-alt/40 p-2">
                <span className="text-xs font-medium text-ink-faint">{scores.leadLabel || '🔍 Analyzing intent...'}</span>
                <Badge tone="neutral">{scores.leadGrade || 'C'}</Badge>
              </div>
            ) : null}

            <div className="ai-consultant__scores">
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
          </div>

          {objections.length > 0 && (
            <div className="ai-consultant__card">
              <h3 className="ai-consultant__card-title">
                <AlertCircle size={16} className="ai-consultant__card-icon ai-consultant__card-icon--warning" />
                Objections ({objections.length})
              </h3>
              <div className="ai-consultant__objections">
                {objections.map((o, i) => (
                  <div key={i} className="ai-consultant__objection">
                    <Badge tone="warning">{o.type}</Badge>
                    <p className="ai-consultant__objection-detail">{o.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ai-consultant__card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="ai-consultant__card-title mb-0">Customer DNA</h3>
              {status === 'active' && liveDna && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-bronze">Live Evolving</span>
              )}
            </div>
            <DnaPanel dna={liveDna} />
          </div>
        </motion.div>
      </div>

      <StayConnectedModal open={showStayConnected} onClose={() => setShowStayConnected(false)} visitorId={getVisitorId()} />
    </div>
  );
}
