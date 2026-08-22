import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Mic, Users } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { scoreSeverity } from '../../utils/vizTokens.js';

const STAGE_TONE = { AWARENESS: 'neutral', CONSIDERATION: 'accent', DECISION: 'good' };

export default function VisitorsTable({ visitors }) {
  const navigate = useNavigate();

  if (visitors.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No visitors yet"
        description="Tracked visitors will show up here as they browse your site."
        action={
          <Button variant="secondary" onClick={() => navigate('/app/settings')}>
            Get your tracking API key
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-wider text-ink-faint">
            <th className="pb-3 font-medium">Visitor</th>
            <th className="pb-3 font-medium">Interest</th>
            <th className="pb-3 font-medium">Stage</th>
            <th className="pb-3 font-medium">Last active</th>
            <th className="pb-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor) => {
            const severity = scoreSeverity(visitor.interestScore);
            return (
              <tr key={visitor.id} className="border-b border-line/60 transition-colors duration-150 hover:bg-champagne/10">
                <td className="py-3">
                  <button className="group text-left" onClick={() => navigate(`/app/visitors/${visitor.id}`)}>
                    <p className="font-medium text-ink transition-colors group-hover:text-coffee">{visitor.name ?? 'Anonymous visitor'}</p>
                    <p className="text-xs text-ink-faint">{visitor.company ?? visitor.email ?? '—'}</p>
                  </button>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full" style={{ backgroundColor: `${severity.color}26` }}>
                      <span className="block h-full rounded-full" style={{ width: `${visitor.interestScore}%`, backgroundColor: severity.color }} />
                    </span>
                    <span className="text-xs font-medium text-ink-2">{visitor.interestScore}</span>
                  </div>
                </td>
                <td className="py-3">
                  <Badge tone={STAGE_TONE[visitor.decisionStage] ?? 'neutral'}>{visitor.decisionStage}</Badge>
                </td>
                <td className="py-3 text-xs text-ink-faint">
                  {formatDistanceToNow(new Date(visitor.lastSeenAt), { addSuffix: true })}
                </td>
                <td className="py-3 text-right">
                  <Button variant="secondary" onClick={() => navigate(`/app/conversation/${visitor.id}`)} className="ml-auto">
                    <Mic className="h-3.5 w-3.5" />
                    Talk
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
