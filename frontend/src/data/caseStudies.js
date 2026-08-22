// Illustrative examples — no real customers exist yet (same convention as
// data/services.js and the homepage's case study teaser section). This is
// the full case study list; Home.jsx's homepage teaser keeps its own
// shorter, independent list of three so a copy edit to one never silently
// changes the other.
export const CASE_STUDIES = [
  {
    company: 'Northwind Retail',
    industry: 'E-commerce',
    result: '3.2x faster lead qualification',
    description: 'Replaced a manual intake form with the AI Sales Consultant, cutting time-to-first-response from hours to under two minutes.',
    challenge: 'Sales reps were spending the first ten minutes of every call re-asking questions the visitor had already answered on the site.',
    solution: 'Deployed the AI Sales Consultant with Customer DNA profiling across the product and pricing pages, so every call opened already informed.',
  },
  {
    company: 'Contoso Cloud',
    industry: 'B2B SaaS',
    result: '47% more demo bookings',
    description: 'Customer DNA profiling let their sales team walk into every demo already knowing the visitor’s budget and timeline.',
    challenge: 'Demo booking rate was flat despite steady traffic growth — most visitors left before ever reaching a form.',
    solution: 'Added the voice AI consultant as a low-friction alternative to a static "Book a demo" form, live on the pricing and product pages.',
  },
  {
    company: 'Fabrikam Health',
    industry: 'Healthcare',
    result: '60% reduction in manual document review',
    description: 'AI automation now handles first-pass intake document review, escalating only the cases that genuinely need a human.',
    challenge: 'A small operations team was buried in manual document review, creating a backlog that delayed patient onboarding.',
    solution: 'Built a document understanding pipeline with human-in-the-loop review for anything below a confidence threshold.',
  },
  {
    company: 'Adventure Works Logistics',
    industry: 'Logistics',
    result: '2.1x faster exception handling',
    description: 'Real-time dashboards surfaced shipment exceptions the moment they occurred instead of in a next-day report.',
    challenge: 'Dispatch only found out about delivery exceptions after the customer complained.',
    solution: 'Rolled out live operational dashboards connected directly to dispatch and tracking systems.',
  },
  {
    company: 'Woodgrove Financial',
    industry: 'Financial Services',
    result: '99.98% uptime on customer-facing systems',
    description: 'A full security and infrastructure review closed compliance gaps ahead of a regulatory audit.',
    challenge: 'A patchwork of legacy systems made it hard to demonstrate compliance posture to auditors.',
    solution: 'Ran a cyber security assessment and rebuilt the highest-risk services on managed cloud infrastructure.',
  },
  {
    company: 'Tailwind Properties',
    industry: 'Real Estate',
    result: '38% more qualified inquiries',
    description: 'The AI Sales Consultant now pre-qualifies budget and timeline before a human agent ever picks up the phone.',
    challenge: 'Agents were spending hours a week on inquiries that were nowhere near ready to transact.',
    solution: 'Added behavior-aware lead scoring so agents could prioritize their day around genuine buying intent.',
  },
];
