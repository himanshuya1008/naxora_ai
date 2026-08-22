import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: 'acme-demo' },
    update: {},
    create: { name: 'Acme Demo Co', slug: 'acme-demo', plan: 'PRO' },
  });

  const passwordHash = await bcrypt.hash('Demo1234!', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'demo@acme.test' },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'Demo Owner',
      email: 'demo@acme.test',
      passwordHash,
      role: 'OWNER',
    },
  });

  const apiKey = await prisma.apiKey.upsert({
    where: { key: 'pk_track_demoapikeydemoapikeydemoapikey00' },
    update: {},
    create: {
      organizationId: organization.id,
      key: 'pk_track_demoapikeydemoapikeydemoapikey00',
      label: 'Demo tracking key',
      type: 'TRACKING_PUBLIC',
    },
  });

  const visitor = await prisma.visitor.upsert({
    where: { organizationId_fingerprint: { organizationId: organization.id, fingerprint: 'demo-fingerprint-001' } },
    update: {},
    create: {
      organizationId: organization.id,
      fingerprint: 'demo-fingerprint-001',
      email: 'lead@examplecorp.com',
      name: 'Jordan Lee',
      company: 'ExampleCorp',
      industry: 'B2B SaaS',
      companySize: 'MID_MARKET',
      interestScore: 78,
      decisionStage: 'DECISION',
    },
  });

  const session = await prisma.session.create({
    data: {
      organizationId: organization.id,
      visitorId: visitor.id,
      referrer: 'https://google.com',
      landingPage: '/product',
      deviceType: 'DESKTOP',
      country: 'US',
      pageViewCount: 6,
      scrollDepthAvg: 82,
      durationSeconds: 540,
    },
  });

  await prisma.behaviorEvent.createMany({
    data: [
      { organizationId: organization.id, visitorId: visitor.id, sessionId: session.id, type: 'PAGE_VIEW', page: '/product', occurredAt: new Date(Date.now() - 1000 * 60 * 40) },
      { organizationId: organization.id, visitorId: visitor.id, sessionId: session.id, type: 'PRICING_VIEW', page: '/pricing', value: 245, occurredAt: new Date(Date.now() - 1000 * 60 * 30) },
      { organizationId: organization.id, visitorId: visitor.id, sessionId: session.id, type: 'ENTERPRISE_VIEW', page: '/enterprise', occurredAt: new Date(Date.now() - 1000 * 60 * 20) },
      { organizationId: organization.id, visitorId: visitor.id, sessionId: session.id, type: 'CASE_STUDY_VIEW', page: '/case-studies/fintech-co', occurredAt: new Date(Date.now() - 1000 * 60 * 12) },
      { organizationId: organization.id, visitorId: visitor.id, sessionId: session.id, type: 'DOWNLOAD', page: '/resources/roi-calculator', label: 'ROI Calculator.pdf', occurredAt: new Date(Date.now() - 1000 * 60 * 5) },
    ],
  });

  await prisma.customerDNA.create({
    data: {
      organizationId: organization.id,
      visitorId: visitor.id,
      version: 1,
      interestScore: 78,
      buyingIntent: 'HIGH',
      budgetSensitivity: 'MEDIUM',
      technicalKnowledge: 'INTERMEDIATE',
      decisionSpeed: 'FAST',
      communicationStyle: 'ANALYTICAL',
      industry: 'B2B SaaS',
      companySize: 'MID_MARKET',
      likelyObjections: ['PRICE', 'TIMING'],
      riskLevel: 'LOW',
      personality: 'pragmatic, data-driven decision maker',
      reasoning: { text: 'Seed data for local development.' },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:');
  // eslint-disable-next-line no-console
  console.log(`  Organization: ${organization.name} (${organization.slug})`);
  // eslint-disable-next-line no-console
  console.log(`  Login:        ${owner.email} / Demo1234!`);
  // eslint-disable-next-line no-console
  console.log(`  Tracking key: ${apiKey.key}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
