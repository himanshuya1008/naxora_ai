/**
 * Live Signal & Lead Intelligence Engine
 * 
 * Analyzes voice conversation transcripts in real time (turn-by-turn) to compute
 * live interest scores, trust scores, buying probabilities, lead qualification tiers,
 * objection detection, and live Customer DNA profiling.
 */

const HIGH_BUYING_SIGNALS = [
  'sign up', 'get started', 'next step', 'move forward', 'when can we start',
  'how do we begin', 'send me a contract', 'send over the details', "let's do it",
  'ready to go', 'pricing', 'price', 'cost', 'how much', 'budget', 'quote',
  'enterprise', 'custom plan', 'demo', 'schedule', 'book a call', 'timeline',
  'immediately', 'asap', 'this week', 'this month', 'decision maker', 'upgrade',
  'purchase', 'buy', 'invest', 'roi', 'integrate', 'integration', 'api access',
  'security', 'soc2', 'compliance', 'sla', 'team size', 'seats', 'licenses'
];

const POSITIVE_VALIDATION_SIGNALS = [
  'great', 'excellent', 'perfect', 'awesome', 'impressive', 'sounds good',
  'sounds great', 'love that', 'exactly what we need', 'makes sense', 'sold',
  'very helpful', 'interested', 'definitely', 'fantastic', 'clear', 'valuable'
];

const OBJECTION_PATTERNS = {
  PRICE: ['expensive', 'too high', 'costly', 'out of budget', 'pricey', 'cheaper', 'discount', 'lower price', 'afford', 'rates are high'],
  TIMING: ['not right now', 'not ready', 'maybe later', 'next quarter', 'next year', 'too busy', 'bad timing', 'no time'],
  TRUST: ['case study', 'case studies', 'references', 'proven', 'guarantee', 'proof', 'data privacy', 'how secure', 'track record'],
  COMPETITOR: ['evaluating others', 'currently using', 'competitor', 'salesforce', 'hubspot', 'alternative', 'other vendor'],
  FEATURE_GAP: ['does it support', 'missing', 'can it do', 'custom feature', 'limitation', 'need it to', 'lack of'],
  AUTHORITY: ['talk to my boss', 'need approval', 'manager', 'board', 'team decision', 'c-suite', 'not the only decision maker', 'consult with']
};

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

/**
 * Evaluates the full transcript so far and produces real-time scores,
 * lead classification, objections, and dynamic Customer DNA.
 */
export function analyzeLiveConversation(transcript = [], baseDna = null) {
  if (!Array.isArray(transcript) || transcript.length === 0) {
    return {
      scores: {
        interestScore: 35,
        trustScore: 50,
        buyingProbability: 20,
        engagementScore: 25,
        objectionCount: 0,
        leadGrade: 'C',
        intentTier: 'DISCOVERY',
        leadLabel: '🔍 Discovery Lead',
      },
      objections: [],
      liveDna: baseDna,
      detectedSignals: [],
    };
  }

  const visitorMessages = transcript.filter((t) => t.role === 'visitor' && t.text);
  const aiMessages = transcript.filter((t) => t.role === 'ai' && t.text);
  const allVisitorText = visitorMessages.map((m) => m.text.toLowerCase()).join(' ');

  let explicitBuyingScore = 0;
  let validationScore = 0;
  const detectedSignals = [];

  // Check buying intent signals
  HIGH_BUYING_SIGNALS.forEach((signal) => {
    if (allVisitorText.includes(signal)) {
      explicitBuyingScore += 6;
      detectedSignals.push(signal);
    }
  });

  // Check positive validation cues
  POSITIVE_VALIDATION_SIGNALS.forEach((signal) => {
    if (allVisitorText.includes(signal)) {
      validationScore += 4;
    }
  });

  // Question count & depth analysis
  const questionCount = (allVisitorText.match(/\?/g) || []).length;
  const visitorWordCount = allVisitorText.split(/\s+/).filter(Boolean).length;
  const totalTurns = visitorMessages.length + aiMessages.length;

  // Detect Objections in real time
  const detectedObjections = [];
  const objectionTypesFound = new Set();

  visitorMessages.forEach((msg) => {
    const textLower = msg.text.toLowerCase();
    for (const [type, keywords] of Object.entries(OBJECTION_PATTERNS)) {
      if (keywords.some((kw) => textLower.includes(kw))) {
        if (!objectionTypesFound.has(type)) {
          objectionTypesFound.add(type);
          detectedObjections.push({
            type,
            detail: msg.text.length > 80 ? msg.text.slice(0, 80) + '...' : msg.text,
          });
        }
      }
    }
  });

  // Calculate base & dynamic scores
  const baseInterest = baseDna?.interestScore ?? 35;
  const engagementDepth = Math.min(35, visitorWordCount * 0.4 + questionCount * 4 + totalTurns * 2);
  
  const interestScore = clamp(
    baseInterest * 0.3 + 
    engagementDepth + 
    explicitBuyingScore + 
    validationScore
  );

  const trustScore = clamp(
    50 + 
    validationScore * 1.5 + 
    Math.min(25, totalTurns * 2.5) - 
    (detectedObjections.length * 7)
  );

  const buyingProbability = clamp(
    (interestScore * 0.5) + 
    (trustScore * 0.35) + 
    (explicitBuyingScore * 0.8) - 
    (detectedObjections.length * 4)
  );

  // Classify Lead Status & Grade
  let leadGrade = 'C';
  let intentTier = 'DISCOVERY';
  let leadLabel = '🔍 Discovery Lead';
  let isHighLead = false;

  if (buyingProbability >= 75 || interestScore >= 75 || explicitBuyingScore >= 18) {
    leadGrade = buyingProbability >= 88 ? 'A+' : 'A';
    intentTier = 'HIGH_LEAD_HOT';
    leadLabel = '🔥 High-Intent Lead';
    isHighLead = true;
  } else if (buyingProbability >= 52 || interestScore >= 55) {
    leadGrade = buyingProbability >= 65 ? 'B+' : 'B';
    intentTier = 'QUALIFIED';
    leadLabel = '⭐ Qualified Prospect';
  } else if (buyingProbability >= 35 || interestScore >= 35) {
    leadGrade = 'C';
    intentTier = 'NURTURING';
    leadLabel = '📈 Nurturing Lead';
  }

  // Communication style & personality profiling
  let communicationStyle = baseDna?.communicationStyle || 'ANALYTICAL';
  if (allVisitorText.includes('roi') || allVisitorText.includes('fast') || allVisitorText.includes('timeline') || allVisitorText.includes('cost')) {
    communicationStyle = 'DRIVER';
  } else if (allVisitorText.includes('love') || allVisitorText.includes('awesome') || allVisitorText.includes('team') || allVisitorText.includes('great')) {
    communicationStyle = 'EXPRESSIVE';
  } else if (allVisitorText.includes('how') || allVisitorText.includes('architecture') || allVisitorText.includes('spec') || allVisitorText.includes('data')) {
    communicationStyle = 'ANALYTICAL';
  }

  const liveDna = {
    ...(baseDna || {}),
    interestScore,
    buyingIntent: buyingProbability >= 75 ? 'VERY_HIGH' : buyingProbability >= 50 ? 'HIGH' : buyingProbability >= 30 ? 'MEDIUM' : 'LOW',
    communicationStyle,
    decisionSpeed: isHighLead ? 'FAST' : baseDna?.decisionSpeed || 'MODERATE',
    budgetSensitivity: detectedObjections.some(o => o.type === 'PRICE') ? 'HIGH' : 'MEDIUM',
    riskLevel: detectedObjections.length > 1 ? 'MEDIUM' : 'LOW',
    personality: isHighLead
      ? 'Decisive, high-intent buyer actively seeking solution alignment and commercial terms.'
      : 'Engaged prospect assessing feature capabilities, team fit, and deployment options.',
    likelyObjections: detectedObjections.length > 0 ? detectedObjections.map(o => o.type) : (baseDna?.likelyObjections || ['PRICE']),
  };

  return {
    scores: {
      interestScore,
      trustScore,
      buyingProbability,
      engagementScore: clamp(engagementDepth * 2.5),
      objectionCount: detectedObjections.length,
      leadGrade,
      intentTier,
      leadLabel,
      isHighLead,
    },
    objections: detectedObjections,
    liveDna,
    detectedSignals: [...new Set(detectedSignals)].slice(0, 5),
  };
}
