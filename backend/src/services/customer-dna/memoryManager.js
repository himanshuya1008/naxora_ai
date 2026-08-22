import { prisma } from '../../config/db.js';
import { PROFILE_FRESH_WINDOW_MS } from './scoringConfig.js';

/**
 * Owns all persistence and cross-session continuity for Customer DNA
 * profiles — the only file in this module that touches the customer_dna
 * table. Keeping every read/write behind this one module gives the rest of
 * the engine (profileBuilder and the analyzers) a pure, DB-free surface.
 */

export async function getLatestBySession({ organizationId, sessionId }) {
  return prisma.customerDnaProfile.findFirst({
    where: { organizationId, sessionId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getHistoryByCustomer({ organizationId, customerId, limit = 20 }) {
  return prisma.customerDnaProfile.findMany({
    where: { organizationId, customerId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });
}

export function isProfileFresh(profile) {
  if (!profile) return false;
  return Date.now() - profile.updatedAt.getTime() < PROFILE_FRESH_WINDOW_MS;
}

export async function createProfile(data) {
  return prisma.customerDnaProfile.create({ data });
}

export async function updateLatestProfile({ organizationId, sessionId, patch }) {
  const latest = await getLatestBySession({ organizationId, sessionId });
  if (!latest) return null;

  return prisma.customerDnaProfile.update({ where: { id: latest.id }, data: patch });
}

/**
 * Cross-session continuity input for profileBuilder: prior sessions'
 * pain points and objections carry forward (a customer's stated problems
 * don't reset just because they started a new session), so a second call
 * doesn't lose context the first one already established.
 */
export async function getCarryForwardContext({ organizationId, customerId }) {
  const previous = await getHistoryByCustomer({ organizationId, customerId, limit: 5 });
  if (previous.length === 0) return { painPoints: [], objections: [], previousGrade: null };

  const painPoints = [...new Set(previous.flatMap((p) => p.painPoints))];
  const objections = [...new Set(previous.flatMap((p) => p.objections))];

  return { painPoints, objections, previousGrade: previous[0].leadGrade };
}

/**
 * Org-wide dashboard aggregate: grade distribution, average scores, and the
 * most common pain points/objections seen across all customers — computed
 * from each customer's MOST RECENT profile only (a customer with five old
 * profiles shouldn't be counted five times in the distribution).
 */
export async function getDashboardAggregate({ organizationId }) {
  const allProfiles = await prisma.customerDnaProfile.findMany({
    where: { organizationId },
    orderBy: { updatedAt: 'desc' },
  });

  const latestPerCustomer = new Map();
  for (const profile of allProfiles) {
    if (!latestPerCustomer.has(profile.customerId)) latestPerCustomer.set(profile.customerId, profile);
  }
  const latestProfiles = [...latestPerCustomer.values()];

  const gradeDistribution = latestProfiles.reduce((acc, p) => {
    acc[p.leadGrade] = (acc[p.leadGrade] ?? 0) + 1;
    return acc;
  }, {});

  const averageScores = latestProfiles.length
    ? {
        interestScore: Math.round(latestProfiles.reduce((sum, p) => sum + p.interestScore, 0) / latestProfiles.length),
        trustScore: Math.round(latestProfiles.reduce((sum, p) => sum + p.trustScore, 0) / latestProfiles.length),
        engagementScore: Math.round(latestProfiles.reduce((sum, p) => sum + p.engagementScore, 0) / latestProfiles.length),
        buyingProbability: Math.round(latestProfiles.reduce((sum, p) => sum + p.buyingProbability, 0) / latestProfiles.length),
      }
    : { interestScore: 0, trustScore: 0, engagementScore: 0, buyingProbability: 0 };

  const painPointCounts = new Map();
  for (const p of latestProfiles) {
    for (const point of p.painPoints) painPointCounts.set(point, (painPointCounts.get(point) ?? 0) + 1);
  }
  const topPainPoints = [...painPointCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([point, count]) => ({ point, count }));

  return {
    totalCustomers: latestProfiles.length,
    gradeDistribution,
    averageScores,
    topPainPoints,
    hotLeads: latestProfiles.filter((p) => p.leadGrade === 'A_PLUS' || p.leadGrade === 'A').length,
  };
}
