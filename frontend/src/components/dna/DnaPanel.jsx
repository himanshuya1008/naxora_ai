import { Fingerprint, Quote, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import CircularScore from '../common/CircularScore.jsx';

const INTENT_TONE = { LOW: 'neutral', MEDIUM: 'warning', HIGH: 'accent', VERY_HIGH: 'good' };

const FIELDS = [
  { key: 'budgetSensitivity', label: 'Budget sensitivity' },
  { key: 'technicalKnowledge', label: 'Technical knowledge' },
  { key: 'decisionSpeed', label: 'Decision speed' },
  { key: 'communicationStyle', label: 'Communication style' },
  { key: 'companySize', label: 'Company size' },
  { key: 'riskLevel', label: 'Risk level' },
];

function formatEnum(value) {
  if (typeof value !== 'string' || !value) return '—';
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');
}

export default function DnaPanel({ dna }) {
  if (!dna) {
    return <EmptyState icon={Fingerprint} title="No DNA profile yet" description="A profile builds automatically as behavior data comes in." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-xl border border-line bg-bg-alt/40 p-4">
        <CircularScore value={dna.interestScore ?? 0} size={72} strokeWidth={6} icon={Fingerprint} />
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Buying intent</span>
          <div className="mt-1">
            <Badge tone={INTENT_TONE[dna.buyingIntent] ?? 'neutral'} dot>
              {formatEnum(dna.buyingIntent)}
            </Badge>
          </div>
        </div>
      </div>

      {dna.personality && (
        <div className="relative overflow-hidden rounded-xl border border-bronze/20 bg-gradient-to-br from-bronze/[0.08] to-champagne/[0.12] p-4">
          <Quote className="absolute -right-1 -top-1 h-14 w-14 text-ink/[0.04]" />
          <p className="relative text-xs italic leading-relaxed text-ink-2">&ldquo;{dna.personality}&rdquo;</p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-2.5">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="rounded-lg border border-line bg-bg-alt/30 p-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-ink-faint">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink-2">{formatEnum(dna[key])}</dd>
          </div>
        ))}
      </dl>

      {Array.isArray(dna.likelyObjections) && dna.likelyObjections.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            <ShieldAlert className="h-3 w-3" />
            Likely objections
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dna.likelyObjections.map((o) => (
              <Badge key={o} tone="warning">
                {formatEnum(o)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
