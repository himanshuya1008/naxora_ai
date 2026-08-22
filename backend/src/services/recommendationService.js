import { STRATEGY_PLAYBOOK, OBJECTION_GUIDANCE } from '../ai/strategyEngine/strategyPlaybook.js';

// Live, in-call service recommendations are the LLM's own decision inside
// ai/conversationBrain/brain.js (it picks RECOMMEND_PLAN/OFFER_DEMO etc. and
// names a specific service in its spoken response, grounded in this same
// playbook text) — this module does not reimplement that judgment call
// deterministically, since a fixed if/else rules engine would just disagree
// with the LLM half the time and add a second, competing source of truth.
// What it DOES provide for real: the playbook/objection text as a proper
// service API (rather than importing the raw constants everywhere), and a
// standalone service-matching helper usable outside the live call — e.g. for
// a report's "recommended next services" section or a future non-voice
// surface — driven by real Customer DNA signals, not fabricated logic.
export function getStrategyGuidance() {
  return STRATEGY_PLAYBOOK;
}

export function getObjectionGuidance() {
  return OBJECTION_GUIDANCE;
}

// Lightweight backend service catalog for matching purposes only — the full,
// rich catalog (descriptions, features, technologies) lives in the frontend
// marketing site's data/services.js and is intentionally not duplicated here
// beyond what's needed to score a match.
const SERVICE_CATALOG = [
  { slug: 'ai-automation', name: 'AI Automation', industries: ['Financial Services', 'Insurance', 'Healthcare', 'Logistics'], minBudgetSensitivity: 'MEDIUM' },
  { slug: 'ai-sales-consultant', name: 'AI Sales Consultant', industries: ['B2B SaaS', 'FinTech', 'Real Estate', 'Professional Services'], minBudgetSensitivity: 'LOW' },
  { slug: 'data-analytics', name: 'Data Analytics', industries: ['E-commerce', 'FinTech', 'SaaS', 'Healthcare'], minBudgetSensitivity: 'MEDIUM' },
  { slug: 'business-intelligence', name: 'Business Intelligence', industries: ['Enterprise Retail', 'Manufacturing', 'Financial Services'], minBudgetSensitivity: 'MEDIUM' },
  { slug: 'web-development', name: 'Web Development', industries: ['B2B SaaS', 'E-commerce', 'Professional Services'], minBudgetSensitivity: 'LOW' },
  { slug: 'mobile-development', name: 'Mobile Development', industries: ['Retail', 'Logistics', 'Healthcare', 'Field Services'], minBudgetSensitivity: 'MEDIUM' },
  { slug: 'cloud-solutions', name: 'Cloud Solutions', industries: ['FinTech', 'Healthcare', 'E-commerce', 'Enterprise'], minBudgetSensitivity: 'HIGH' },
  { slug: 'enterprise-software', name: 'Enterprise Software', industries: ['Financial Services', 'Manufacturing', 'Logistics', 'Enterprise Retail'], minBudgetSensitivity: 'HIGH' },
  { slug: 'crm-solutions', name: 'CRM Solutions', industries: ['B2B SaaS', 'Professional Services', 'Real Estate', 'Financial Services'], minBudgetSensitivity: 'MEDIUM' },
  { slug: 'ai-chatbots', name: 'AI Chatbots', industries: ['E-commerce', 'SaaS', 'FinTech', 'Healthcare'], minBudgetSensitivity: 'LOW' },
  { slug: 'dashboard-development', name: 'Dashboard Development', industries: ['SaaS', 'E-commerce', 'Enterprise Retail', 'Financial Services'], minBudgetSensitivity: 'MEDIUM' },
  { slug: 'cyber-security', name: 'Cyber Security', industries: ['Financial Services', 'Healthcare', 'E-commerce', 'Enterprise'], minBudgetSensitivity: 'HIGH' },
];

const BUDGET_RANK = { LOW: 0, MEDIUM: 1, HIGH: 2 };

// Matches real Customer DNA signals (industry, budget sensitivity) against
// the service catalog — a genuine filter, not a fabricated placeholder list.
export function getServiceRecommendations(dna, { limit = 3 } = {}) {
  if (!dna) return [];

  const affordability = BUDGET_RANK[dna.budgetSensitivity] ?? 1;

  return SERVICE_CATALOG.filter((service) => BUDGET_RANK[service.minBudgetSensitivity] <= affordability)
    .map((service) => ({
      ...service,
      matchesIndustry: dna.industry ? service.industries.includes(dna.industry) : false,
    }))
    .sort((a, b) => Number(b.matchesIndustry) - Number(a.matchesIndustry))
    .slice(0, limit);
}
