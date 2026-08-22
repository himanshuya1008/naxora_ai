import { SERVICES } from './services.js';

// Short, authored descriptions per industry — same "professionally written
// but illustrative copy" convention as services.js (no real customer data
// implied). The industry list itself and its linked services are derived
// directly from SERVICES below rather than duplicated by hand, so this page
// can never drift out of sync with the services catalog.
const INDUSTRY_DESCRIPTIONS = {
  'Financial Services': 'Automate compliance-heavy workflows and give sales teams a live read on prospect intent without adding headcount.',
  Insurance: 'Process claims and underwriting documents faster with AI automation built for regulated environments.',
  Healthcare: 'Reduce administrative burden and protect patient data while giving your team faster, clearer operational visibility.',
  Logistics: 'Automate dispatch, tracking, and exception handling across a fast-moving, high-volume operation.',
  'B2B SaaS': 'Qualify inbound leads the moment they land, and give your revenue team a live Customer DNA read before the first call.',
  FinTech: 'Ship compliant, secure product experiences faster with infrastructure and analytics built for regulated finance.',
  'Real Estate': "Turn every website visitor into a qualified conversation with an AI consultant that already knows what they're browsing.",
  'Professional Services': 'Modernize client-facing systems and free up billable hours currently lost to manual coordination.',
  'E-commerce': 'Understand shopper behavior in real time and turn browsing data into faster, more relevant conversions.',
  SaaS: 'Give your product and growth teams a live analytics layer instead of a weekly export.',
  'Enterprise Retail': 'Bring enterprise-scale inventory, pricing, and customer data into one governed, queryable view.',
  Manufacturing: 'Connect shop-floor and business systems so leadership can see real performance, not lagging reports.',
  Retail: 'Equip field and store teams with mobile tools built for how they actually work.',
  'Field Services': 'Give dispatch and field teams real-time visibility from the job site to the back office.',
  Enterprise: 'Scale infrastructure and security to match the size of the organization, without slowing teams down.',
};

const servicesByIndustry = SERVICES.reduce((map, service) => {
  for (const industry of service.industries) {
    map[industry] = map[industry] ?? [];
    map[industry].push(service);
  }
  return map;
}, {});

export const INDUSTRIES = Object.entries(servicesByIndustry).map(([name, services]) => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  description: INDUSTRY_DESCRIPTIONS[name] ?? `Tailored ${name.toLowerCase()} solutions built around how your team actually sells and operates.`,
  services,
}));
