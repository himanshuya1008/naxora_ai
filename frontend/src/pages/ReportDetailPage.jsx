import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { getConversation } from '../services/conversationService.js';
import { getReport, regenerateReport } from '../services/reportService.js';
import { getErrorMessage } from '../utils/errors.js';
import { toast } from '../store/toastStore.js';
import GlassCard from '../components/common/GlassCard.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import ScoreMeter from '../components/common/ScoreMeter.jsx';
import DnaPanel from '../components/dna/DnaPanel.jsx';

function ReportDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </GlassCard>
        <GlassCard>
          <Skeleton className="mb-4 h-4 w-28" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </GlassCard>
      </div>
      <GlassCard>
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

export default function ReportDetailPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [report, setReport] = useState(null);
  const [reportMissing, setReportMissing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const convo = await getConversation(conversationId);
      setConversation(convo.conversation);
      setMessages(convo.messages);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Failed to load this conversation.'));
      return;
    }

    try {
      setReport(await getReport(conversationId));
      setReportMissing(false);
    } catch {
      setReportMissing(true);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      setReport(await regenerateReport(conversationId));
      setReportMissing(false);
      toast.success('Report generated successfully.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to generate the report.'));
    } finally {
      setRegenerating(false);
    }
  };

  if (loadError) {
    return <ErrorState description={loadError} onRetry={load} />;
  }

  return (
    <AnimatePresence mode="wait">
      {!conversation ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }}>
          <ReportDetailSkeleton />
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
          <button onClick={() => navigate(-1)} className="flex w-fit items-center gap-1.5 text-sm text-ink-faint hover:text-ink-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {reportMissing ? (
            <GlassCard className="flex flex-col items-center gap-4 py-12 text-center">
              {conversation.status === 'ACTIVE' ? (
                <p className="text-sm text-ink-faint">This conversation is still in progress — the report generates once it ends.</p>
              ) : (
                <>
                  <p className="text-sm text-ink-faint">Report generation is still running, or hasn&apos;t started yet.</p>
                  <Button onClick={handleRegenerate} loading={regenerating}>
                    <RefreshCw className="h-4 w-4" />
                    Generate report
                  </Button>
                </>
              )}
            </GlassCard>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <GlassCard className="lg:col-span-2">
                  <h2 className="mb-4 card-title">Summary</h2>
                  <p className="text-sm leading-relaxed text-ink-2">{report.transcriptSummary}</p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <ScoreMeter label="Sales performance" value={report.salesPerformanceScore} />
                    <ScoreMeter label="Buying probability" value={report.buyingProbability} />
                  </div>
                </GlassCard>

                <GlassCard>
                  <h2 className="mb-4 card-title">CRM summary</h2>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-faint">Deal stage</span>
                      <Badge tone="accent">{report.crmSummary?.dealStage}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink-faint">Priority</span>
                      <Badge tone={report.crmSummary?.priority === 'HIGH' ? 'critical' : 'neutral'}>{report.crmSummary?.priority}</Badge>
                    </div>
                    <p className="text-ink-faint">{report.crmSummary?.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.crmSummary?.tags?.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <GlassCard>
                  <h2 className="mb-4 flex items-center gap-2 card-title">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Recommendations
                  </h2>
                  <ul className="flex flex-col gap-2 text-sm text-ink-2">
                    {report.recommendations?.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-success">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </GlassCard>

                <GlassCard>
                  <h2 className="mb-4 flex items-center gap-2 card-title">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Missed opportunities
                  </h2>
                  <ul className="flex flex-col gap-2 text-sm text-ink-2">
                    {report.missedOpportunities?.length ? (
                      report.missedOpportunities.map((m, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-warning">•</span>
                          {m}
                        </li>
                      ))
                    ) : (
                      <p className="text-ink-faint">None identified.</p>
                    )}
                  </ul>
                </GlassCard>
              </div>

              <GlassCard>
                <h2 className="mb-4 flex items-center gap-2 card-title">
                  <Calendar className="h-4 w-4 text-bronze" />
                  Suggested follow-up
                </h2>
                <div className="flex flex-col gap-2">
                  {report.suggestedFollowUp?.map((f, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-line bg-bg-alt/40 p-3 text-sm">
                      <div>
                        <Badge tone="accent">{f.channel}</Badge>
                        <p className="mt-1.5 text-ink-2">{f.message}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-faint">{f.suggestedDate && format(new Date(f.suggestedDate), 'MMM d')}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard>
                <h2 className="mb-4 card-title">Customer DNA at time of call</h2>
                <DnaPanel dna={report.dnaSnapshot} />
              </GlassCard>
            </>
          )}

          <GlassCard>
            <h2 className="mb-4 card-title">Transcript</h2>
            <div className="flex flex-col gap-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'AI' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[75%] rounded-xl2 px-4 py-2.5 text-sm ${
                      m.role === 'AI' ? 'border border-line bg-surface text-ink' : 'bg-gradient-to-br from-bronze to-coffee text-[#FFFFFF]'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
