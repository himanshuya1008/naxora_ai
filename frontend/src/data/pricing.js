// Shared by the full Pricing page and the Home page's pricing preview
// so both always render identical plan data.
export const PLANS = [
  {
    name: 'Starter',
    price: '$499',
    period: '/mo',
    description: 'For small teams getting started with AI-driven sales intelligence.',
    features: ['Up to 5,000 tracked visitors/mo', 'Behavior Intelligence Engine', 'Customer DNA profiling', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$1,499',
    period: '/mo',
    description: 'For growing sales teams that need real-time AI conversations.',
    features: [
      'Up to 50,000 tracked visitors/mo',
      'Everything in Starter',
      'AI Sales Consultant (voice)',
      'Live analytics dashboard',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with custom volume, security, or integration needs.',
    features: ['Unlimited tracked visitors', 'Everything in Growth', 'Custom integrations', 'Dedicated account manager', 'SLA & compliance support'],
    highlighted: false,
  },
];
