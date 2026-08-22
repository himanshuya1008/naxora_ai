import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import { getMyConversation } from '../../services/visitorPortalService.js';
import { getErrorMessage } from '../../utils/errors.js';
import GlassCard from '../../components/common/GlassCard.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export default function VisitorConversationDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await getMyConversation(id);
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/visitor/conversations" className="auth-btn-back w-fit">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to conversations
      </Link>

      {status === 'loading' && (
        <GlassCard className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </GlassCard>
      )}

      {status === 'error' && <ErrorState description={error} onRetry={load} />}

      {status === 'success' && (
        <>
          {data.report && (
            <GlassCard>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">AI Summary</p>
              <p className="mt-2 text-sm text-ink-2">{data.report.transcriptSummary}</p>
            </GlassCard>
          )}

          <GlassCard className="flex flex-col gap-4">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              Transcript · {format(new Date(data.conversation.startedAt), 'MMM d, yyyy · h:mm a')}
            </p>
            <div className="flex flex-col gap-3">
              {data.messages.length === 0 && <p className="text-sm text-ink-faint">No messages recorded for this conversation.</p>}
              {data.messages.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                    message.role === 'VISITOR'
                      ? 'ml-auto rounded-tr-sm bg-gradient-to-br from-bronze to-coffee text-[#FFFFFF]'
                      : 'mr-auto rounded-tl-sm border border-line bg-surface text-ink'
                  )}
                >
                  {message.content}
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
