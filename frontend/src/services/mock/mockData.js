import { subDays, format } from 'date-fns';

// Dev-only fixtures for the demo-mode service fallback (see utils/demoMode.js
// and the try/catch in each services/*.js file). Shapes mirror exactly what
// the real API returns so pages need zero awareness that this exists.
//
// Structured as one relational array of "deals" (a visitor + its behavior +
// DNA + conversation + report, all sharing one id suffix) so a click-through
// from the Dashboard's visitor table or the Reports list always lands on a
// matching, internally-consistent detail page instead of a generic stub.

function dayString(daysAgo) {
  return format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
}

// Deterministic pseudo-random (no external dependency) so the demo dashboard
// looks the same on every reload instead of jittering distractingly.
function seededNoise(seed) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

const minutesAgo = (n) => new Date(Date.now() - n * 60 * 1000).toISOString();
const hoursAgo = (n) => new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const DEAL_SEEDS = [
  {
    n: 1, name: 'Sarah Chen', company: 'Northwind Logistics', domain: 'northwindlogistics.com',
    decisionStage: 'DECISION', interestScore: 87, trustScore: 78, buyingProbability: 82,
    dealStage: 'PROPOSAL', priority: 'HIGH', lastSeenMinutesAgo: 12,
    buyingIntent: 'VERY_HIGH', budgetSensitivity: 'LOW', technicalKnowledge: 'HIGH', decisionSpeed: 'FAST',
    communicationStyle: 'ANALYTICAL', companySize: 'MID_MARKET', riskLevel: 'LOW', personality: 'Direct, data-driven, wants ROI numbers up front.',
    objections: ['INTEGRATION_COMPLEXITY'], pricingDwell: 210, scrollDepth: 88,
    painPoints: ['Manual lead qualification', 'Slow rep ramp-up time'],
    summary: 'Sarah leads ops at a mid-market logistics firm evaluating AI sales tooling to cut qualification time. Strong technical fit, comparing us against one competitor.',
    recommendations: ['Send the API integration guide referenced on the call', 'Loop in their solutions engineer for a technical deep-dive', 'Follow up with a case study from a similar logistics customer'],
    missed: ['Did not confirm budget range before the call ended'],
    followUp: [{ channel: 'EMAIL', message: 'Send integration guide + logistics case study', days: 2 }],
    tags: ['logistics', 'technical-buyer', 'high-intent'],
  },
  {
    n: 2, name: 'Marcus Webb', company: 'Fintrust Capital', domain: 'fintrustcapital.com',
    decisionStage: 'CONSIDERATION', interestScore: 74, trustScore: 61, buyingProbability: 55,
    dealStage: 'DEMO_REQUESTED', priority: 'MEDIUM', lastSeenMinutesAgo: 47,
    buyingIntent: 'HIGH', budgetSensitivity: 'HIGH', technicalKnowledge: 'MEDIUM', decisionSpeed: 'SLOW',
    communicationStyle: 'AMIABLE', companySize: 'ENTERPRISE', riskLevel: 'MEDIUM', personality: 'Cautious, consensus-driven, needs sign-off from procurement.',
    objections: ['PRICE', 'COMPETITOR'], pricingDwell: 340, scrollDepth: 95,
    painPoints: ['Compliance overhead on vendor approval', 'Budget cycle locked until next quarter'],
    summary: 'Marcus is evaluating for a large financial services org. Price-sensitive and comparing against an incumbent competitor; procurement cycle is the main blocker.',
    recommendations: ['Prepare an ROI comparison against the named competitor', 'Offer a pilot-scoped pricing tier to de-risk the budget conversation', 'Ask for the procurement timeline explicitly'],
    missed: ['Competitor name was mentioned but not explored further'],
    followUp: [{ channel: 'CALL', message: 'Follow up once next budget cycle opens', days: 14 }],
    tags: ['fintech', 'price-sensitive', 'enterprise'],
  },
  {
    n: 3, name: null, company: 'Redstone Analytics', domain: null,
    decisionStage: 'AWARENESS', interestScore: 33, trustScore: 40, buyingProbability: 21,
    dealStage: 'NEW', priority: 'LOW', lastSeenMinutesAgo: 600,
    buyingIntent: 'LOW', budgetSensitivity: 'MEDIUM', technicalKnowledge: 'MEDIUM', decisionSpeed: 'SLOW',
    communicationStyle: 'ANALYTICAL', companySize: 'SMB', riskLevel: 'MEDIUM', personality: 'Early-stage browsing, gathering information rather than actively buying.',
    objections: ['TIMING'], pricingDwell: 40, scrollDepth: 52,
    painPoints: ['Currently using spreadsheets for lead tracking'],
    summary: 'Anonymous visitor from a small analytics firm, early in the research phase. Low engagement so far — first touch only.',
    recommendations: ['Nurture with educational content rather than a sales push', 'Re-engage after they view the pricing page again'],
    missed: ['No discovery questions were answered before disconnecting'],
    followUp: [{ channel: 'EMAIL', message: 'Send intro nurture sequence', days: 5 }],
    tags: ['early-stage', 'smb'],
  },
  {
    n: 4, name: 'Elena Petrova', company: 'Bright Horizon Retail', domain: 'brighthorizon.io',
    decisionStage: 'DECISION', interestScore: 93, trustScore: 85, buyingProbability: 91,
    dealStage: 'NEGOTIATION', priority: 'HIGH', lastSeenMinutesAgo: 25,
    buyingIntent: 'VERY_HIGH', budgetSensitivity: 'LOW', technicalKnowledge: 'MEDIUM', decisionSpeed: 'FAST',
    communicationStyle: 'DRIVER', companySize: 'MID_MARKET', riskLevel: 'LOW', personality: 'Decisive, results-oriented, negotiating final contract terms.',
    objections: ['CONTRACT_TERMS'], pricingDwell: 280, scrollDepth: 100,
    painPoints: ['Losing deals due to slow follow-up after store visits'],
    summary: 'Elena runs sales ops for a growing retail chain. Deal is in final negotiation — discussing contract length and onboarding timeline.',
    recommendations: ['Send the redlined contract with the requested 12-month term', 'Confirm onboarding start date to keep momentum'],
    missed: [],
    followUp: [{ channel: 'EMAIL', message: 'Send updated contract for signature', days: 1 }],
    tags: ['retail', 'closing-soon', 'high-value'],
  },
  {
    n: 5, name: 'James Okafor', company: 'Vertex Manufacturing', domain: 'vertexmfg.com',
    decisionStage: 'AWARENESS', interestScore: 45, trustScore: 38, buyingProbability: 28,
    dealStage: 'CLOSED_LOST', priority: 'LOW', lastSeenMinutesAgo: 360,
    buyingIntent: 'LOW', budgetSensitivity: 'HIGH', technicalKnowledge: 'LOW', decisionSpeed: 'SLOW',
    communicationStyle: 'AMIABLE', companySize: 'SMB', riskLevel: 'HIGH', personality: 'Interested in principle but budget was cut before the deal could progress.',
    objections: ['PRICE', 'TIMING'], pricingDwell: 95, scrollDepth: 61,
    painPoints: ['Manual scheduling of factory floor sales visits'],
    summary: 'James liked the product but Vertex froze new software spend this quarter. Marked closed-lost; revisit next budget cycle.',
    recommendations: ['Re-engage in Q1 when budget resets', 'Send a lightweight case study to stay top-of-mind'],
    missed: ['Budget freeze wasn’t surfaced until late in the call'],
    followUp: [{ channel: 'EMAIL', message: 'Check back when new budget cycle opens', days: 90 }],
    tags: ['manufacturing', 'closed-lost', 'budget-frozen'],
  },
  {
    n: 6, name: 'Priya Nair', company: 'CloudScale Systems', domain: 'cloudscale.dev',
    decisionStage: 'CONSIDERATION', interestScore: 68, trustScore: 70, buyingProbability: 64,
    dealStage: 'QUALIFIED', priority: 'MEDIUM', lastSeenMinutesAgo: 90,
    buyingIntent: 'HIGH', budgetSensitivity: 'MEDIUM', technicalKnowledge: 'HIGH', decisionSpeed: 'MEDIUM',
    communicationStyle: 'ANALYTICAL', companySize: 'MID_MARKET', riskLevel: 'LOW', personality: 'Technically sharp, wants to see the API docs before committing further.',
    objections: ['FEATURE_GAP'], pricingDwell: 150, scrollDepth: 74,
    painPoints: ['No visibility into which visitors are sales-ready'],
    summary: 'Priya is a technical evaluator at a cloud infrastructure company. Wants confirmation on a specific webhook feature before moving forward.',
    recommendations: ['Confirm webhook support directly with engineering', 'Share the API reference docs'],
    missed: ['Feature gap question was not fully answered on the call'],
    followUp: [{ channel: 'EMAIL', message: 'Send webhook feature confirmation', days: 3 }],
    tags: ['developer-tools', 'technical-evaluator'],
  },
  {
    n: 7, name: 'Tom Whitfield', company: 'Ironclad Insurance', domain: 'ironcladins.com',
    decisionStage: 'DECISION', interestScore: 81, trustScore: 90, buyingProbability: 95,
    dealStage: 'CLOSED_WON', priority: 'HIGH', lastSeenMinutesAgo: 5,
    buyingIntent: 'VERY_HIGH', budgetSensitivity: 'LOW', technicalKnowledge: 'MEDIUM', decisionSpeed: 'FAST',
    communicationStyle: 'DRIVER', companySize: 'ENTERPRISE', riskLevel: 'LOW', personality: 'Enthusiastic champion internally, pushed the deal through quickly.',
    objections: [], pricingDwell: 260, scrollDepth: 100,
    painPoints: ['Long onboarding time for new sales reps'],
    summary: 'Tom championed this internally and closed within three weeks of first contact — one of the fastest cycles this quarter.',
    recommendations: ['Kick off onboarding immediately to preserve momentum', 'Ask for a reference call / case study given the strong close'],
    missed: [],
    followUp: [{ channel: 'CALL', message: 'Kickoff call for onboarding', days: 2 }],
    tags: ['insurance', 'closed-won', 'champion'],
  },
  {
    n: 8, name: null, company: null, domain: null,
    decisionStage: 'CONSIDERATION', interestScore: 61, trustScore: 55, buyingProbability: 39,
    lastSeenMinutesAgo: 180, dealStage: 'NEW', priority: 'LOW',
    buyingIntent: 'MEDIUM', budgetSensitivity: 'MEDIUM', technicalKnowledge: 'MEDIUM', decisionSpeed: 'MEDIUM',
    communicationStyle: 'AMIABLE', companySize: 'SMB', riskLevel: 'MEDIUM', personality: 'Anonymous but repeat visitor, hasn’t identified their company yet.',
    objections: ['TRUST'], pricingDwell: 130, scrollDepth: 70,
    painPoints: ['Unclear which plan fits their team size'],
    summary: 'Unidentified repeat visitor, third session this month. Engaged with pricing and FAQ pages but hasn’t left contact details.',
    recommendations: ['Prompt with a plan-comparison chatbot on next visit', 'Consider a gated case study to capture contact info'],
    missed: ['No email captured despite three sessions'],
    followUp: [{ channel: 'IN_APP', message: 'Show plan comparison on next visit', days: 1 }],
    tags: ['anonymous', 'repeat-visitor'],
  },
  {
    n: 9, name: 'Grace Lindqvist', company: 'Meridian Health Systems', domain: 'meridianhealth.org',
    decisionStage: 'DECISION', interestScore: 79, trustScore: 72, buyingProbability: 77,
    dealStage: 'PROPOSAL', priority: 'HIGH', lastSeenMinutesAgo: 70,
    buyingIntent: 'HIGH', budgetSensitivity: 'MEDIUM', technicalKnowledge: 'MEDIUM', decisionSpeed: 'MEDIUM',
    communicationStyle: 'EXPRESSIVE', companySize: 'ENTERPRISE', riskLevel: 'MEDIUM', personality: 'Relationship-oriented, wants to understand the team behind the product.',
    objections: ['COMPLIANCE'], pricingDwell: 190, scrollDepth: 83,
    painPoints: ['HIPAA compliance concerns with any new vendor'],
    summary: 'Grace evaluates vendors for a healthcare network. Compliance and data handling are the primary gating questions for legal sign-off.',
    recommendations: ['Send the security/compliance whitepaper', 'Offer a call with legal/compliance lead'],
    missed: ['Did not confirm data residency requirements'],
    followUp: [{ channel: 'EMAIL', message: 'Send compliance whitepaper + schedule legal call', days: 3 }],
    tags: ['healthcare', 'compliance-sensitive'],
  },
  {
    n: 10, name: 'Omar Al-Farsi', company: 'Solstice Energy Partners', domain: 'solsticeenergy.com',
    decisionStage: 'CONSIDERATION', interestScore: 71, trustScore: 66, buyingProbability: 58,
    dealStage: 'DEMO_REQUESTED', priority: 'MEDIUM', lastSeenMinutesAgo: 200,
    buyingIntent: 'HIGH', budgetSensitivity: 'MEDIUM', technicalKnowledge: 'MEDIUM', decisionSpeed: 'MEDIUM',
    communicationStyle: 'DRIVER', companySize: 'MID_MARKET', riskLevel: 'MEDIUM', personality: 'Pragmatic, wants a live demo before involving the rest of the team.',
    objections: ['FEATURE_GAP', 'TIMING'], pricingDwell: 165, scrollDepth: 77,
    painPoints: ['Sales team spread across multiple time zones'],
    summary: 'Omar leads a regional sales team and wants a live demo before pitching internally. Timing depends on their Q3 planning cycle.',
    recommendations: ['Schedule the requested live demo within the week', 'Prepare a multi-timezone rollout plan to address the stated concern'],
    missed: ['Demo request was made but not yet scheduled'],
    followUp: [{ channel: 'CALL', message: 'Schedule live product demo', days: 4 }],
    tags: ['energy', 'demo-requested'],
  },
];

function messagesFor(seed) {
  const openLine = seed.name
    ? `Hi ${seed.name.split(' ')[0]}, I noticed you've been looking at ${seed.pricingDwell > 150 ? 'our pricing in detail' : 'a few of our feature pages'} — are you currently evaluating solutions for ${seed.company ?? 'your team'}?`
    : `Hi there, I noticed you've spent some time on our pricing and FAQ pages — happy to answer anything that would help.`;

  return [
    { id: `${seed.n}-m1`, role: 'AI', content: openLine },
    { id: `${seed.n}-m2`, role: 'VISITOR', content: `Yes, we're looking at ${seed.painPoints[0]?.toLowerCase() ?? 'a few options'} right now.` },
    { id: `${seed.n}-m3`, role: 'AI', content: `Got it. Most teams your size see that resolved within the first month — want me to walk through how ${seed.company ?? 'a similar team'} would roll this out?` },
    { id: `${seed.n}-m4`, role: 'VISITOR', content: seed.objections[0] ? `Sure, though I'm a bit concerned about ${seed.objections[0].toLowerCase().replaceAll('_', ' ')}.` : 'Sure, that would help.' },
    { id: `${seed.n}-m5`, role: 'AI', content: seed.objections[0] ? `That's a fair concern — let me walk you through how we typically handle that.` : `Great — here's how the rollout typically looks.` },
  ];
}

function buildDeal(seed) {
  const visitor = {
    id: `demo-visitor-${seed.n}`,
    name: seed.name,
    company: seed.company,
    email: seed.name && seed.domain ? `${seed.name.toLowerCase().replace(' ', '.')}@${seed.domain}` : seed.domain ? `visitor@${seed.domain}` : null,
    decisionStage: seed.decisionStage,
    interestScore: seed.interestScore,
    firstSeenAt: daysAgo(seed.n + 4),
    lastSeenAt: minutesAgo(seed.lastSeenMinutesAgo),
  };

  const behaviorSummary = {
    interestScore: seed.interestScore,
    sessionCount: 2 + (seed.n % 4),
    pricingDwellSeconds: seed.pricingDwell,
    scrollDepthAvg: seed.scrollDepth,
    painPointSignals: seed.painPoints,
    journey: [
      { type: 'PAGE_VIEW', page: '/pricing', occurredAt: hoursAgo(seed.n + 2) },
      { type: 'PAGE_VIEW', page: '/case-studies', occurredAt: hoursAgo(seed.n + 1) },
      { type: 'FORM_INTERACTION', page: '/contact', occurredAt: minutesAgo(seed.lastSeenMinutesAgo + 20) },
    ],
  };

  const dna = {
    buyingIntent: seed.buyingIntent,
    budgetSensitivity: seed.budgetSensitivity,
    technicalKnowledge: seed.technicalKnowledge,
    decisionSpeed: seed.decisionSpeed,
    communicationStyle: seed.communicationStyle,
    companySize: seed.companySize,
    riskLevel: seed.riskLevel,
    personality: seed.personality,
    likelyObjections: seed.objections,
  };

  const conversation = {
    id: `demo-convo-${seed.n}`,
    status: seed.dealStage === 'CLOSED_WON' || seed.dealStage === 'CLOSED_LOST' || seed.dealStage === 'NEGOTIATION' || seed.dealStage === 'PROPOSAL' ? 'ENDED' : 'ENDED',
    startedAt: hoursAgo(seed.n * 3),
  };

  const messages = messagesFor(seed);

  const report = {
    id: `demo-report-${seed.n}`,
    conversationId: conversation.id,
    generatedAt: hoursAgo(seed.n * 3 - 1),
    buyingProbability: seed.buyingProbability,
    salesPerformanceScore: Math.min(98, Math.round(seed.buyingProbability * 0.9 + seed.trustScore * 0.1)),
    transcriptSummary: seed.summary,
    recommendations: seed.recommendations,
    missedOpportunities: seed.missed,
    suggestedFollowUp: seed.followUp.map((f) => ({ channel: f.channel, message: f.message, suggestedDate: daysAgo(-f.days) })),
    dnaSnapshot: dna,
    crmSummary: {
      dealStage: seed.dealStage,
      priority: seed.priority,
      summary: seed.summary,
      tags: seed.tags,
    },
    conversation: { visitor: { name: visitor.name, company: visitor.company } },
  };

  return { visitor, behaviorSummary, dna, conversation, messages, report };
}

const DEALS = DEAL_SEEDS.map(buildDeal);
const dealById = (id) => DEALS.find((d) => d.visitor.id === id || d.conversation.id === id);

// --- Dashboard + Analytics overview -----------------------------------------

export const mockOverview = {
  totalVisitors: 1284,
  activeVisitors: 9,
  totalConversations: 342,
  activeConversations: 7,
  reportsGenerated: 298,
  leadsGenerated: 156,
  qualifiedLeads: 41,
  demoRequests: 23,
  avgSessionDurationSeconds: 312,
  leadsByStage: [
    { stage: 'AWARENESS', count: 612 },
    { stage: 'CONSIDERATION', count: 431 },
    { stage: 'DECISION', count: 241 },
  ],
  objectionBreakdown: [
    { type: 'PRICE', count: 87 },
    { type: 'TIMING', count: 54 },
    { type: 'FEATURE_GAP', count: 39 },
    { type: 'TRUST', count: 22 },
    { type: 'COMPETITOR', count: 18 },
  ],
};

export function mockTrends(days = 30) {
  const conversationsByDay = [];
  const visitorsByDay = [];
  const interestScoreByDay = [];
  const buyingProbabilityByDay = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = dayString(i);
    const weekday = subDays(new Date(), i).getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const noise = seededNoise(i + 1);
    const trendUp = (days - i) * 0.15;

    const visitors = Math.max(4, Math.round((isWeekend ? 22 : 44) + trendUp * 3 + noise * 18));
    visitorsByDay.push({ day, count: visitors });

    conversationsByDay.push({ day, count: Math.max(1, Math.round((isWeekend ? 5 : 11) + trendUp + noise * 6)) });

    interestScoreByDay.push({ day, avgInterestScore: Math.min(95, Math.max(20, Math.round(48 + trendUp * 0.8 + noise * 16))) });

    buyingProbabilityByDay.push({ day, avgBuyingProbability: Math.min(92, Math.round(42 + (days - i) * 0.6 + noise * 14)) });
  }

  return { conversationsByDay, visitorsByDay, interestScoreByDay, buyingProbabilityByDay };
}

// --- Recent visitors table ---------------------------------------------------

export const mockVisitors = DEALS.map((d) => ({
  id: d.visitor.id,
  name: d.visitor.name,
  company: d.visitor.company,
  email: d.visitor.email,
  interestScore: d.visitor.interestScore,
  decisionStage: d.visitor.decisionStage,
  lastSeenAt: d.visitor.lastSeenAt,
}));

export const mockLeadAnalytics = {
  mostViewedServices: [
    { service: 'AI Automation', count: 214 },
    { service: 'Data Analytics', count: 187 },
    { service: 'Custom Software Development', count: 152 },
    { service: 'Cloud Solutions', count: 118 },
    { service: 'Digital Marketing', count: 96 },
  ],
  popularIndustries: [
    { industry: 'B2B SaaS', count: 62 },
    { industry: 'Financial Services', count: 44 },
    { industry: 'Healthcare', count: 31 },
    { industry: 'Manufacturing', count: 19 },
  ],
  budgetDistribution: [
    { budget: '$10k-50k/mo', count: 38 },
    { budget: '$1k-10k/mo', count: 29 },
    { budget: '$50k+/mo', count: 12 },
    { budget: 'Not sure yet', count: 9 },
  ],
  visitorTimeline: mockVisitors.slice(0, 8).map((v, i) => ({
    id: `demo-event-${i}`,
    type: i % 2 === 0 ? 'SERVICE_VIEW' : 'PAGE_VIEW',
    page: '/services/ai-automation',
    label: i % 2 === 0 ? 'AI Automation' : null,
    occurredAt: v.lastSeenAt,
    visitor: { id: v.id, name: v.name, company: v.company },
  })),
};

export function mockVisitorDetail(id) {
  const deal = dealById(id) ?? DEALS[0];
  return {
    visitor: deal.visitor,
    behaviorSummary: deal.behaviorSummary,
    customerDNA: deal.dna,
    conversations: [{ id: deal.conversation.id, startedAt: deal.conversation.startedAt, status: deal.conversation.status }],
  };
}

// --- Conversation detail (Report Detail page's transcript) -------------------

export function mockConversationDetail(conversationId) {
  const deal = dealById(conversationId) ?? DEALS[0];
  return { conversation: deal.conversation, messages: deal.messages };
}

// --- Reports list + detail ----------------------------------------------------

export const mockReports = DEALS.map((d) => ({
  id: d.report.id,
  conversationId: d.report.conversationId,
  generatedAt: d.report.generatedAt,
  buyingProbability: d.report.buyingProbability,
  conversation: d.report.conversation,
  crmSummary: d.report.crmSummary,
}));

export function mockReportDetail(conversationId) {
  const deal = DEALS.find((d) => d.conversation.id === conversationId) ?? DEALS[0];
  return deal.report;
}

// --- Settings: organization / team / API keys --------------------------------

export const mockOrganization = {
  id: 'demo-org',
  name: 'Acme Robotics Inc.',
  createdAt: daysAgo(180),
};

export const mockTeam = [
  { id: 'demo-user-1', name: 'Priya Sharma', email: 'priya.sharma@acmerobotics.com', role: 'OWNER' },
  { id: 'demo-user-2', name: 'Daniel Osei', email: 'daniel.osei@acmerobotics.com', role: 'ADMIN' },
  { id: 'demo-user-3', name: 'Mei Lin', email: 'mei.lin@acmerobotics.com', role: 'MEMBER' },
];

export const mockApiKeys = [
  { id: 'demo-key-1', label: 'Marketing site', key: 'pk_demo_7f3a9c2e1b4d6f8a', createdAt: daysAgo(60), revokedAt: null },
  { id: 'demo-key-2', label: 'Staging environment', key: 'pk_demo_1a2b3c4d5e6f7g8h', createdAt: daysAgo(120), revokedAt: daysAgo(30) },
];

// --- Customer DNA dashboard aggregate ----------------------------------------

export const mockDnaDashboard = {
  totalCustomers: DEALS.length,
  gradeDistribution: { A_PLUS: 2, A: 2, B_PLUS: 2, B: 2, C: 1, D: 1 },
  averageScores: { interestScore: 71, trustScore: 67, engagementScore: 64, buyingProbability: 62 },
  topPainPoints: [
    { point: 'Manual lead qualification', count: 4 },
    { point: 'Slow rep ramp-up time', count: 3 },
    { point: 'No visibility into which visitors are sales-ready', count: 3 },
    { point: 'Long onboarding time for new sales reps', count: 2 },
    { point: 'Unclear which plan fits their team size', count: 2 },
  ],
  hotLeads: 4,
};

// --- Voice provider settings (no real endpoint exists yet; demo-only) -------

export const mockVoiceSettings = {
  sttProvider: 'Deepgram',
  ttsProvider: 'ElevenLabs',
  voiceId: '21m00Tcm4TlvDq8ikWAM',
  voiceName: 'Rachel — Warm, professional',
  availableVoices: [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel — Warm, professional' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi — Confident, energetic' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella — Friendly, upbeat' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni — Calm, reassuring' },
  ],
};
