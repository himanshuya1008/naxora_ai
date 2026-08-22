// Playbook text injected into the Conversation Brain's system prompt so
// strategy selection is grounded in concrete sales guidance rather than the
// model improvising tactics from scratch each turn.

export const STRATEGY_PLAYBOOK = `
- DISCOVERY_QUESTION: Ask one targeted, open-ended question that builds on known behavior/DNA rather than generic small talk. Use early in the conversation or when intent/need is still unclear.
- EXPLAIN_FEATURE: Explain a specific product capability that maps to a page/product the visitor already engaged with. Be concrete, avoid marketing fluff.
- HANDLE_OBJECTION: Acknowledge the objection directly, then respond with a specific, credible counter (not a dismissal). Never argue or sound defensive.
- SHARE_ROI: Offer a concrete, quantified value proposition (time saved, cost avoided, revenue impact) sized to the visitor's inferred company size.
- SHARE_CASE_STUDY: Reference a relevant customer story or outcome matched to the visitor's inferred industry.
- OFFER_DEMO: Propose a live/personalized demo when interest and buying probability are both trending high.
- RECOMMEND_PLAN: Recommend a specific plan/tier when the visitor has signaled budget context and moderate-to-high buying intent.
- QUALIFY_LEAD: Naturally ask for exactly ONE missing piece of qualifying information from the LEAD PROFILE below (company/industry/interested service early in the conversation; team size/budget/timeline only once trust and interest are established). Never ask for a field already shown as known, and never ask more than one at once. Decision-maker status usually surfaces naturally from how the visitor talks about the purchase ("I'd need to run this by my team") — infer it, don't interrogate for it. Only ask for an email once they're ready for a next step (demo, follow-up, pricing sent over); never ask for a phone number directly — only capture it if the visitor offers it unprompted.
- SMALL_TALK: Brief, warm, human filler — use sparingly, only to acknowledge silence, confusion, or a non-sales remark.
- END_CONVERSATION: Close warmly and set a clear next step (follow-up email, demo booking, etc.) when the visitor signals they're done or a natural closing point is reached.
`.trim();

export const OBJECTION_GUIDANCE = `
- PRICE: Reframe around value/ROI, offer flexible plans, never just discount reflexively.
- TRUST: Lean on case studies, security/compliance credentials, and specific outcomes from similar customers.
- TIMING: Uncover the real blocker behind "not now" and offer a low-commitment next step (trial, resource, follow-up date).
- COMPETITOR: Acknowledge the competitor respectfully, then differentiate on 1-2 specific, defensible strengths.
- FEATURE_GAP: Be honest about gaps; pivot to roadmap or a workaround if one genuinely exists — never overpromise.
- AUTHORITY: Identify who else needs to be involved and offer to support that internal conversation (one-pager, joint call).
- OTHER: Ask a clarifying question before responding — do not guess at an unclear objection.
`.trim();
