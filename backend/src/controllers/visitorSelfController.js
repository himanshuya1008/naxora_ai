import { prisma } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, comparePassword } from '../utils/password.js';

function toPublicVisitor(visitor) {
  const { passwordHash: _passwordHash, ...publicVisitor } = visitor;
  return publicVisitor;
}

// Every query below filters on `visitorId: req.visitor.id` (never just
// organizationId) — req.visitor is only ever set by protectVisitor after
// verifying the JWT, so one visitor can never read another's data by
// guessing an id in the URL, unlike the admin-side endpoints which are
// intentionally organization-wide.

// "Dashboard" overview — this visitor's own numbers, not a duplicate of the
// admin analytics endpoints (those are organization-wide aggregates).
export const getMyOverview = catchAsync(async (req, res) => {
  const visitorId = req.visitor.id;

  const [conversationCount, leadCount, lastConversation] = await Promise.all([
    prisma.conversation.count({ where: { visitorId } }),
    prisma.lead.count({ where: { visitorId } }),
    prisma.conversation.findFirst({ where: { visitorId }, orderBy: { startedAt: 'desc' } }),
  ]);

  res.status(200).json({
    success: true,
    data: { visitor: toPublicVisitor(req.visitor), conversationCount, leadCount, lastConversation },
  });
});

export const listMyConversations = catchAsync(async (req, res) => {
  const { page, pageSize } = req.query;
  const where = { visitorId: req.visitor.id };

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { report: { select: { transcriptSummary: true, buyingProbability: true, salesPerformanceScore: true } } },
    }),
    prisma.conversation.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: { conversations, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } },
  });
});

export const getMyConversationDetail = catchAsync(async (req, res) => {
  const conversation = await prisma.conversation.findFirst({
    where: { id: req.params.id, visitorId: req.visitor.id },
  });
  if (!conversation) throw AppError.notFound('Conversation not found');

  const [messages, report] = await Promise.all([
    prisma.message.findMany({ where: { conversationId: conversation.id }, orderBy: { sequence: 'asc' } }),
    prisma.report.findUnique({ where: { conversationId: conversation.id } }),
  ]);

  res.status(200).json({ success: true, data: { conversation, messages, report } });
});

// "My Requests" — leads (demo requests / service interest) tied to this
// visitor, whether captured by the AI mid-conversation or a marketing-site
// form submitted while identified.
export const listMyLeads = catchAsync(async (req, res) => {
  const { page, pageSize } = req.query;
  const where = { visitorId: req.visitor.id };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: { leads, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } },
  });
});

export const updateMyProfile = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (email && email !== req.visitor.email) {
    const existing = await prisma.visitor.findFirst({
      where: {
        organizationId: req.visitor.organizationId,
        email,
        isRegistered: true,
        id: { not: req.visitor.id },
      },
    });
    if (existing) throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
  }

  const visitor = await prisma.visitor.update({ where: { id: req.visitor.id }, data: req.body });
  res.status(200).json({ success: true, data: { visitor: toPublicVisitor(visitor) } });
});

export const changeMyPassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.visitor.passwordHash || !(await comparePassword(currentPassword, req.visitor.passwordHash))) {
    throw AppError.unauthorized('Current password is incorrect', 'INVALID_CREDENTIALS');
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.visitor.update({ where: { id: req.visitor.id }, data: { passwordHash } });

  res.status(200).json({ success: true, data: null });
});
