export function buildReportPrompt({ conversation, messages, dna, finalScores, objections }) {
  const transcript = messages.map((m) => `${m.role === 'AI' ? 'Sales Consultant' : 'Visitor'}: ${m.content}`).join('\n');

  return `Analyze this completed AI sales voice conversation and produce a structured
post-call sales report for the human sales team, as if written by an experienced
sales manager reviewing the call.

CUSTOMER DNA AT TIME OF CALL
${JSON.stringify(dna, null, 2)}

FINAL LIVE SCORES
- Interest score: ${finalScores.interestScore}/100
- Trust score: ${finalScores.trustScore}/100
- Buying probability: ${finalScores.buyingProbability}/100
- Objections raised: ${objections.map((o) => `${o.type} (${o.handled ? 'handled' : 'unresolved'})`).join(', ') || 'none'}

CALL METADATA
- Duration: ${conversation.durationSeconds ?? 'unknown'} seconds
- Ended: ${conversation.status}

FULL TRANSCRIPT
${transcript}

Produce the sales report now. Be specific and actionable — avoid generic advice
a sales rep couldn't act on today.`;
}
