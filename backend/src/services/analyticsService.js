import { prisma } from '../config/db.js';

const ACTIVE_VISITOR_WINDOW_MS = 5 * 60 * 1000;

export async function getOverview(organizationId) {
  const [
    totalVisitors,
    activeVisitors,
    totalConversations,
    activeConversations,
    interestAgg,
    leadsByStage,
    objectionGroups,
    reportsGenerated,
    leadsGenerated,
    qualifiedLeads,
    demoRequests,
    sessionDurationAgg,
  ] = await Promise.all([
    prisma.visitor.count({ where: { organizationId } }),
    prisma.visitor.count({ where: { organizationId, lastSeenAt: { gte: new Date(Date.now() - ACTIVE_VISITOR_WINDOW_MS) } } }),
    prisma.conversation.count({ where: { organizationId } }),
    prisma.conversation.count({ where: { organizationId, status: 'ACTIVE' } }),
    prisma.visitor.aggregate({ where: { organizationId }, _avg: { interestScore: true } }),
    prisma.visitor.groupBy({ by: ['decisionStage'], where: { organizationId }, _count: { _all: true } }),
    prisma.objectionLog.groupBy({ by: ['type'], where: { conversation: { organizationId } }, _count: { _all: true } }),
    prisma.report.count({ where: { conversation: { organizationId } } }),
    prisma.lead.count({ where: { organizationId } }),
    prisma.lead.count({ where: { organizationId, status: 'QUALIFIED' } }),
    prisma.lead.count({ where: { organizationId, source: 'BOOK_DEMO_FORM' } }),
    prisma.session.aggregate({ where: { organizationId }, _avg: { durationSeconds: true } }),
  ]);

  return {
    totalVisitors,
    activeVisitors,
    totalConversations,
    activeConversations,
    avgInterestScore: Math.round(interestAgg._avg.interestScore ?? 0),
    leadsByStage: leadsByStage.map((g) => ({ stage: g.decisionStage, count: g._count._all })),
    objectionBreakdown: objectionGroups.map((g) => ({ type: g.type, count: g._count._all })),
    reportsGenerated,
    leadsGenerated,
    qualifiedLeads,
    demoRequests,
    avgSessionDurationSeconds: Math.round(sessionDurationAgg._avg.durationSeconds ?? 0),
  };
}

export async function getTrends(organizationId, rawDays) {
  const days = Math.min(Math.max(Number(rawDays) || 30, 1), 180);

  const [conversationsByDay, buyingProbabilityByDay] = await Promise.all([
    prisma.$queryRaw`
      SELECT date_trunc('day', "startedAt") AS day, COUNT(*)::int AS count
      FROM "Conversation"
      WHERE "organizationId" = ${organizationId}
        AND "startedAt" >= NOW() - (${days} || ' days')::interval
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw`
      SELECT date_trunc('day', r."generatedAt") AS day, AVG(r."buyingProbability")::float AS "avgBuyingProbability"
      FROM "Report" r
      JOIN "Conversation" c ON c.id = r."conversationId"
      WHERE c."organizationId" = ${organizationId}
        AND r."generatedAt" >= NOW() - (${days} || ' days')::interval
      GROUP BY day
      ORDER BY day ASC
    `,
  ]);

  return { conversationsByDay, buyingProbabilityByDay };
}

// Lead-generation-specific analytics — separate from getOverview so the
// Dashboard's fast, always-loaded KPI row isn't coupled to these heavier,
// Analytics-page-only aggregations.
export async function getLeadAnalytics(organizationId) {
  const [mostViewedServices, popularIndustries, budgetGroups, visitorTimeline] = await Promise.all([
    prisma.behaviorEvent.groupBy({
      by: ['label'],
      where: { organizationId, type: 'SERVICE_VIEW', label: { not: null } },
      _count: { label: true },
      orderBy: { _count: { label: 'desc' } },
      take: 10,
    }),
    prisma.lead.groupBy({
      by: ['industry'],
      where: { organizationId, industry: { not: null } },
      _count: { industry: true },
      orderBy: { _count: { industry: 'desc' } },
      take: 10,
    }),
    prisma.lead.groupBy({
      by: ['budget'],
      where: { organizationId, budget: { not: null } },
      _count: { budget: true },
      orderBy: { _count: { budget: 'desc' } },
    }),
    prisma.behaviorEvent.findMany({
      where: { organizationId },
      orderBy: { occurredAt: 'desc' },
      take: 30,
      select: {
        id: true,
        type: true,
        page: true,
        label: true,
        occurredAt: true,
        visitor: { select: { id: true, name: true, company: true } },
      },
    }),
  ]);

  return {
    mostViewedServices: mostViewedServices.map((g) => ({ service: g.label, count: g._count.label })),
    popularIndustries: popularIndustries.map((g) => ({ industry: g.industry, count: g._count.industry })),
    // Budget is a free-text bucket ("$10k-50k/mo"), not a number — reported
    // as a distribution rather than a numeric average, which would be
    // meaningless (and error-prone to parse) across arbitrary sales-entered
    // strings.
    budgetDistribution: budgetGroups.map((g) => ({ budget: g.budget, count: g._count.budget })),
    visitorTimeline,
  };
}
