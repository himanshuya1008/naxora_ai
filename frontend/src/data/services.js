import {
  Bot,
  Mic,
  BarChart3,
  LineChart,
  Globe,
  Smartphone,
  Cloud,
  Building2,
  Users,
  MessageSquare,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

// Static marketing content — professionally written but illustrative copy
// (no real company/customer data was supplied). Distinct from Dashboard/
// Analytics, which are 100% real database data — this is authored product
// copy, the same category of content as any SaaS marketing site's own text.
export const SERVICES = [
  {
    slug: 'ai-automation',
    name: 'AI Automation',
    icon: Bot,
    tagline: 'Automate repetitive work with production-grade AI agents.',
    overview:
      'We design and deploy AI automation that removes manual, repetitive work from your operations — from intelligent document processing to autonomous workflow agents that reason, decide, and act inside your existing systems.',
    features: [
      'Custom LLM-powered workflow agents',
      'Document understanding & extraction pipelines',
      'Process mining to find automation opportunities',
      'Human-in-the-loop review for high-stakes decisions',
      'Integration with your existing CRM/ERP/ticketing tools',
    ],
    benefits: [
      'Cut manual processing time by 60-90%',
      'Reduce error rates on repetitive data tasks',
      'Free your team to focus on higher-value work',
      'Scale operations without linear headcount growth',
    ],
    technologies: ['OpenAI / Anthropic APIs', 'LangChain', 'Python', 'Node.js', 'Vector databases'],
    industries: ['Financial Services', 'Insurance', 'Healthcare', 'Logistics'],
  },
  {
    slug: 'ai-sales-consultant',
    name: 'AI Sales Consultant',
    icon: Mic,
    tagline: 'A voice AI that already knows why your visitor is here.',
    overview:
      'Our own AI Sales Consultant studies visitor behavior in real time — pages viewed, pricing visits, time spent — builds a live Customer DNA profile, then opens a natural voice conversation already informed about what they care about. No generic "how can I help you" scripts.',
    features: [
      'Real-time behavior tracking across your site',
      'Customer DNA profiling (intent, budget sensitivity, technical depth)',
      'Live voice conversation via streaming speech-to-text and text-to-speech',
      'Objection prediction and in-call strategy adjustment',
      'Structured lead capture with every conversation',
    ],
    benefits: [
      'Qualify leads before a human rep ever joins',
      'Cut average first-response time to under two minutes',
      'Every conversation ends with a CRM-ready summary',
      'Available 24/7, no missed after-hours inquiries',
    ],
    technologies: ['Deepgram', 'ElevenLabs', 'OpenAI / Anthropic APIs', 'WebSockets', 'PostgreSQL'],
    industries: ['B2B SaaS', 'FinTech', 'Real Estate', 'Professional Services'],
  },
  {
    slug: 'data-analytics',
    name: 'Data Analytics',
    icon: BarChart3,
    tagline: 'Turn scattered data into decisions you can act on today.',
    overview:
      'We unify data from across your business — product, sales, marketing, support — into a single reliable source of truth, then build the dashboards and models that let your team make decisions with real evidence instead of guesswork.',
    features: [
      'Data warehouse & pipeline architecture',
      'Custom dashboards and reporting',
      'Predictive and prescriptive modeling',
      'Data quality auditing and cleansing',
      'Self-serve analytics enablement for your team',
    ],
    benefits: [
      'Spot trends and risks before they become problems',
      'Replace spreadsheet chaos with a single source of truth',
      'Make every team’s reporting consistent and trustworthy',
      'Faster, evidence-based decision-making',
    ],
    technologies: ['PostgreSQL / Snowflake', 'dbt', 'Python (pandas, scikit-learn)', 'Recharts / D3', 'Airflow'],
    industries: ['E-commerce', 'FinTech', 'SaaS', 'Healthcare'],
  },
  {
    slug: 'business-intelligence',
    name: 'Business Intelligence',
    icon: LineChart,
    tagline: 'Real-time visibility into the metrics that matter.',
    overview:
      'We build BI systems that give every level of your organization — from frontline teams to the boardroom — live, accurate visibility into the KPIs that drive the business, without waiting on a monthly spreadsheet export.',
    features: [
      'Executive KPI dashboards',
      'Automated report distribution',
      'Cross-department metric standardization',
      'Drill-down and cohort analysis tooling',
      'Alerting on metric thresholds',
    ],
    benefits: [
      'Everyone works from the same numbers',
      'Catch performance issues in days, not months',
      'Reduce time spent building manual reports',
      'Support faster, more confident board-level decisions',
    ],
    technologies: ['Power BI / Looker-style tooling', 'SQL', 'Data warehousing', 'ETL pipelines'],
    industries: ['Enterprise Retail', 'Manufacturing', 'Financial Services'],
  },
  {
    slug: 'web-development',
    name: 'Web Development',
    icon: Globe,
    tagline: 'Fast, modern websites built to convert.',
    overview:
      'We design and build marketing sites, customer portals, and web applications that are fast, accessible, and built on a design system your team can maintain — not a black-box template.',
    features: [
      'Marketing site design & development',
      'Customer/partner portals',
      'Headless CMS integration',
      'Performance and SEO optimization',
      'Accessibility (WCAG) compliance',
    ],
    benefits: [
      'Higher conversion rates from better UX',
      'A site your team can actually update',
      'Faster load times, better search ranking',
      'A design system that scales with new pages',
    ],
    technologies: ['React / Next.js', 'Tailwind CSS', 'Node.js', 'Headless CMS (Contentful/Sanity-style)'],
    industries: ['B2B SaaS', 'E-commerce', 'Professional Services'],
  },
  {
    slug: 'mobile-development',
    name: 'Mobile Development',
    icon: Smartphone,
    tagline: 'Native-quality iOS and Android apps, one codebase.',
    overview:
      'We build cross-platform mobile applications that feel native, ship fast, and are built for long-term maintainability — from customer-facing apps to internal field-operations tools.',
    features: [
      'Cross-platform app development (iOS + Android)',
      'Push notifications & offline support',
      'Third-party API and payment integration',
      'App Store / Play Store release management',
      'Ongoing maintenance and version support',
    ],
    benefits: [
      'One codebase, two app stores',
      'Faster time-to-market than separate native teams',
      'Consistent experience across devices',
      'Lower long-term maintenance cost',
    ],
    technologies: ['React Native', 'Expo', 'TypeScript', 'Firebase', 'App Store Connect / Google Play Console'],
    industries: ['Retail', 'Logistics', 'Healthcare', 'Field Services'],
  },
  {
    slug: 'cloud-solutions',
    name: 'Cloud Solutions',
    icon: Cloud,
    tagline: 'Reliable, cost-efficient cloud infrastructure.',
    overview:
      'We design, migrate, and manage cloud infrastructure that’s secure, observable, and cost-optimized — whether you’re moving off legacy on-prem systems or scaling an existing cloud footprint.',
    features: [
      'Cloud migration planning and execution',
      'Infrastructure-as-code architecture',
      'Cost optimization audits',
      'Security and compliance hardening',
      'Observability and incident response setup',
    ],
    benefits: [
      'Lower infrastructure spend without sacrificing reliability',
      'Faster deployment cycles',
      'Reduced operational risk and downtime',
      'A clear audit trail for compliance requirements',
    ],
    technologies: ['AWS / GCP / Azure', 'Terraform', 'Kubernetes', 'Docker', 'Datadog-style observability'],
    industries: ['FinTech', 'Healthcare', 'E-commerce', 'Enterprise'],
  },
  {
    slug: 'enterprise-software',
    name: 'Enterprise Software',
    icon: Building2,
    tagline: 'Mission-critical systems built to scale with your organization.',
    overview:
      'We design and build enterprise-grade software — internal platforms, multi-tenant systems, and large-scale integrations — engineered for the reliability, security, and long-term maintainability that mission-critical operations demand.',
    features: [
      'Multi-tenant platform architecture',
      'Legacy system modernization',
      'Role-based access and audit logging',
      'High-availability infrastructure design',
      'Long-term maintenance and support contracts',
    ],
    benefits: [
      'Software built around your actual workflows, not a template',
      'Own your platform outright — no vendor lock-in',
      'Built to scale from hundreds to hundreds of thousands of users',
      'Reduced operational risk from aging legacy systems',
    ],
    technologies: ['Node.js / Express', 'React', 'PostgreSQL', 'Docker', 'Kubernetes'],
    industries: ['Financial Services', 'Manufacturing', 'Logistics', 'Enterprise Retail'],
  },
  {
    slug: 'crm-solutions',
    name: 'CRM Solutions',
    icon: Users,
    tagline: 'CRM systems your sales team will actually use.',
    overview:
      "We implement, customize, and integrate CRM systems around how your sales team actually sells — from pipeline configuration to deep integrations with the tools you already rely on — so adoption isn't a fight.",
    features: [
      'CRM implementation and migration',
      'Custom pipeline and workflow configuration',
      'Third-party integrations (marketing, support, billing)',
      'Data cleansing and deduplication',
      'Sales team onboarding and adoption support',
    ],
    benefits: [
      'Higher rep adoption from day one',
      'A single source of truth for every deal',
      'Automated handoffs between marketing, sales, and support',
      'Cleaner data for more accurate forecasting',
    ],
    technologies: ['Salesforce / HubSpot-style platforms', 'REST & webhook integrations', 'ETL pipelines', 'PostgreSQL'],
    industries: ['B2B SaaS', 'Professional Services', 'Real Estate', 'Financial Services'],
  },
  {
    slug: 'ai-chatbots',
    name: 'AI Chatbots',
    icon: MessageSquare,
    tagline: 'Conversational AI that resolves, not just deflects.',
    overview:
      'We build chatbots that actually resolve customer questions — grounded in your real product data and support content — with clean handoff to a human whenever the conversation needs one.',
    features: [
      'Retrieval-augmented responses grounded in your docs/data',
      'Multi-channel deployment (web, WhatsApp, in-app)',
      'Seamless human handoff and escalation rules',
      'Conversation analytics and gap detection',
      'Continuous tuning from real conversation data',
    ],
    benefits: [
      'Resolve common questions instantly, 24/7',
      'Reduce support ticket volume on repetitive issues',
      'Consistent answers grounded in your actual content',
      'Clear visibility into what customers are actually asking',
    ],
    technologies: ['OpenAI / Anthropic APIs', 'Vector databases', 'LangChain', 'WhatsApp Business API', 'Node.js'],
    industries: ['E-commerce', 'SaaS', 'FinTech', 'Healthcare'],
  },
  {
    slug: 'dashboard-development',
    name: 'Dashboard Development',
    icon: LayoutDashboard,
    tagline: 'Real-time dashboards built around the decisions you actually make.',
    overview:
      'We design and build custom dashboards — executive overviews, operational consoles, customer-facing analytics — that surface the exact metrics your team acts on, backed by live data instead of static exports.',
    features: [
      'Custom KPI and executive dashboards',
      'Real-time data visualization (charts, funnels, timelines)',
      'Role-based views for different teams',
      'Exportable reports (CSV/PDF)',
      'Drill-down and cohort-level analysis',
    ],
    benefits: [
      'Everyone sees the same live numbers, no stale spreadsheets',
      'Faster, more confident day-to-day decisions',
      'Dashboards built around your actual metrics, not generic templates',
      'Less time spent manually assembling reports',
    ],
    technologies: ['React', 'Recharts / D3', 'PostgreSQL', 'WebSockets', 'Node.js / Express'],
    industries: ['SaaS', 'E-commerce', 'Enterprise Retail', 'Financial Services'],
  },
  {
    slug: 'cyber-security',
    name: 'Cyber Security',
    icon: ShieldCheck,
    tagline: 'Security built into the system, not bolted on after.',
    overview:
      'We help you find and close security gaps before they become incidents — from infrastructure hardening to access control design — so security is a built-in property of your systems, not an afterthought.',
    features: [
      'Security audits and penetration testing',
      'Access control and authentication hardening',
      'Infrastructure and network security review',
      'Incident response planning',
      'Compliance readiness assessments',
    ],
    benefits: [
      'Find and fix vulnerabilities before attackers do',
      'Reduce risk of costly data breaches and downtime',
      'Clear audit trail for compliance conversations',
      'A pragmatic roadmap, not just a scary report',
    ],
    technologies: ['OWASP-based tooling', 'Static & dynamic analysis', 'Cloud IAM hardening', 'SIEM/observability integration'],
    industries: ['Financial Services', 'Healthcare', 'E-commerce', 'Enterprise'],
  },
];

export function getServiceBySlug(slug) {
  return SERVICES.find((s) => s.slug === slug);
}

// AI Sales Consultant is also a live, interactive feature of this site —
// its card should deep-link straight into that experience rather than a
// generic static detail page (which still exists and works if visited directly).
export function getServiceHref(service) {
  return service.slug === 'ai-sales-consultant' ? '/ai-consultant' : `/services/${service.slug}`;
}
