import { prisma } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { generateReport } from '../ai/reportGenerator/reportGenerator.js';

async function assertConversationInOrg(conversationId, organizationId) {
  const conversation = await prisma.conversation.findFirst({ where: { id: conversationId, organizationId } });
  if (!conversation) throw AppError.notFound('Conversation not found');
  return conversation;
}

export const getReport = catchAsync(async (req, res) => {
  await assertConversationInOrg(req.params.conversationId, req.organizationId);

  const report = await prisma.report.findUnique({ where: { conversationId: req.params.conversationId } });
  if (!report) throw AppError.notFound('Report not yet generated for this conversation');

  res.status(200).json({ success: true, data: { report } });
});

export const regenerateReport = catchAsync(async (req, res) => {
  const conversation = await assertConversationInOrg(req.params.conversationId, req.organizationId);
  if (conversation.status === 'ACTIVE') {
    throw AppError.badRequest('Cannot generate a report for a conversation that is still active');
  }

  const report = await generateReport(req.params.conversationId);
  res.status(200).json({ success: true, data: { report } });
});

export const listReports = catchAsync(async (req, res) => {
  const reports = await prisma.report.findMany({
    where: { conversation: { organizationId: req.organizationId } },
    orderBy: { generatedAt: 'desc' },
    take: 50,
    include: { conversation: { include: { visitor: { select: { id: true, name: true, company: true } } } } },
  });

  res.status(200).json({ success: true, data: { reports } });
});
