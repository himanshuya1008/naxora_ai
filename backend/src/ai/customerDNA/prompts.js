export function buildDnaGenerationPrompt({ visitor, behaviorSummary }) {
  return `You are a B2B sales intelligence analyst. Build a "Customer DNA" profile for a
website visitor based ONLY on their observed behavior below. Do not invent facts
that aren't supported by the data — where signal is weak, choose the more
conservative/neutral option rather than guessing confidently.

VISITOR
- Known company: ${visitor.company ?? 'unknown'}
- Known industry: ${visitor.industry ?? 'unknown'}
- First seen: ${visitor.firstSeenAt}
- Sessions: ${behaviorSummary.sessionCount}
- Last active: ${behaviorSummary.lastActiveAt ?? 'unknown'}

BEHAVIOR SUMMARY
- Heuristic interest score (0-100, already computed, do not recompute): ${behaviorSummary.interestScore}
- Decision stage inferred from journey: ${behaviorSummary.decisionStage}
- Product pages most viewed: ${behaviorSummary.productPreference ?? 'none'}
- Pricing page dwell time: ${behaviorSummary.pricingDwellSeconds}s
- Average scroll depth: ${behaviorSummary.scrollDepthAvg}%
- High-intent signal count (pricing/enterprise/downloads/form submits): ${behaviorSummary.highIntentSignalCount}
- Search/FAQ topics (possible pain points): ${behaviorSummary.painPointSignals.join(', ') || 'none observed'}

JOURNEY (chronological, most recent ${Math.min(behaviorSummary.journey.length, 25)} events)
${behaviorSummary.journey
  .slice(-25)
  .map((e) => `- [${e.occurredAt}] ${e.type} ${e.page}`)
  .join('\n')}

Produce the Customer DNA profile now.`;
}
