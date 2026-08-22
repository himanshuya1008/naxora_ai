import { prisma } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { getBehaviorSummary } from '../services/behavior/behaviorSummaryService.js';

export const listVisitors = catchAsync(async (req, res) => {
  const { page, pageSize, minInterestScore, decisionStage, sortBy } = req.query;

  const where = {
    organizationId: req.organizationId,
    ...(minInterestScore !== undefined ? { interestScore: { gte: minInterestScore } } : {}),
    ...(decisionStage ? { decisionStage } : {}),
  };

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      orderBy: { [sortBy]: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.visitor.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: { visitors, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } },
  });
});

export const getVisitor = catchAsync(async (req, res) => {
  const visitor = await prisma.visitor.findFirst({ where: { id: req.params.id, organizationId: req.organizationId } });
  if (!visitor) throw AppError.notFound('Visitor not found');

  const [latestDna, conversations] = await Promise.all([
    prisma.customerDNA.findFirst({ where: { visitorId: visitor.id }, orderBy: { version: 'desc' } }),
    prisma.conversation.findMany({
      where: { visitorId: visitor.id },
      orderBy: { startedAt: 'desc' },
      take: 10,
      select: { id: true, status: true, startedAt: true, endedAt: true, channel: true },
    }),
  ]);

  const { behaviorSummary } = await getBehaviorSummary(visitor.id);

  res.status(200).json({ success: true, data: { visitor, behaviorSummary, customerDNA: latestDna, conversations } });
});

export const getVisitorDnaHistory = catchAsync(async (req, res) => {
  const visitor = await prisma.visitor.findFirst({ where: { id: req.params.id, organizationId: req.organizationId } });
  if (!visitor) throw AppError.notFound('Visitor not found');

  const history = await prisma.customerDNA.findMany({
    where: { visitorId: visitor.id },
    orderBy: { version: 'asc' },
  });

  res.status(200).json({ success: true, data: { history } });
});
