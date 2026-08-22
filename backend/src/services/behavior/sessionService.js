import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

export async function startSession({ organizationId, visitorId, referrer, landingPage, userAgent, deviceType, country, region }) {
  return prisma.session.create({
    data: { organizationId, visitorId, referrer, landingPage, userAgent, deviceType, country, region },
  });
}

export async function endSession({ organizationId, sessionId, durationSeconds, pageViewCount, scrollDepthAvg }) {
  const session = await prisma.session.findFirst({ where: { id: sessionId, organizationId } });
  if (!session) throw AppError.notFound('Session not found');

  return prisma.session.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      durationSeconds: durationSeconds ?? session.durationSeconds,
      pageViewCount: pageViewCount ?? session.pageViewCount,
      scrollDepthAvg: scrollDepthAvg ?? session.scrollDepthAvg,
    },
  });
}
