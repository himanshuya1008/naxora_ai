import { prisma } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import {
  startConversation as startConversationService,
  startConversationForDashboard,
  endConversation as endConversationService,
} from '../services/conversationService.js';

export const startConversation = catchAsync(async (req, res) => {
  const { conversation, vapiPublicKey, assistantId, assistantOverrides } = await startConversationService({
    organizationId: req.organizationId,
    ...req.body,
  });
  res.status(201).json({ success: true, data: { conversation, vapiPublicKey, assistantId, assistantOverrides } });
});

export const startDashboardConversation = catchAsync(async (req, res) => {
  const { conversation, vapiPublicKey, assistantId, assistantOverrides } = await startConversationForDashboard({
    organizationId: req.organizationId,
    visitorId: req.body.visitorId,
    language: req.body.language,
  });
  res.status(201).json({ success: true, data: { conversation, vapiPublicKey, assistantId, assistantOverrides } });
});

export const endConversation = catchAsync(async (req, res) => {
  const conversation = await endConversationService({ organizationId: req.organizationId, conversationId: req.params.id });
  res.status(200).json({ success: true, data: { conversation } });
});

export const listConversations = catchAsync(async (req, res) => {
  const { page, pageSize, status } = req.query;
  const where = { organizationId: req.organizationId, ...(status ? { status } : {}) };

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { visitor: { select: { id: true, name: true, email: true, company: true, interestScore: true } } },
    }),
    prisma.conversation.count({ where }),
  ]);

  res.status(200).json({ success: true, data: { conversations, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } } });
});

export const getConversation = catchAsync(async (req, res) => {
  const conversation = await prisma.conversation.findFirst({
    where: { id: req.params.id, organizationId: req.organizationId },
    include: { visitor: true },
  });
  if (!conversation) throw AppError.notFound('Conversation not found');

  const [messages, scoreSnapshots, objections, report] = await Promise.all([
    prisma.message.findMany({ where: { conversationId: conversation.id }, orderBy: { sequence: 'asc' } }),
    prisma.conversationScoreSnapshot.findMany({ where: { conversationId: conversation.id }, orderBy: { capturedAt: 'asc' } }),
    prisma.objectionLog.findMany({ where: { conversationId: conversation.id } }),
    prisma.report.findUnique({ where: { conversationId: conversation.id } }),
  ]);

  res.status(200).json({ success: true, data: { conversation, messages, scoreSnapshots, objections, report } });
});
