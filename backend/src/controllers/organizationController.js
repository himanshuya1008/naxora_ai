import { prisma } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { generateApiKey } from '../utils/apiKey.js';

export const getOrganization = catchAsync(async (req, res) => {
  const organization = await prisma.organization.findUniqueOrThrow({
    where: { id: req.organizationId },
  });
  res.status(200).json({ success: true, data: { organization } });
});

export const updateOrganization = catchAsync(async (req, res) => {
  const organization = await prisma.organization.update({
    where: { id: req.organizationId },
    data: req.body,
  });
  res.status(200).json({ success: true, data: { organization } });
});

export const listTeamMembers = catchAsync(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { organizationId: req.organizationId },
    select: { id: true, name: true, email: true, role: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.status(200).json({ success: true, data: { users } });
});

export const listApiKeys = catchAsync(async (req, res) => {
  const apiKeys = await prisma.apiKey.findMany({
    where: { organizationId: req.organizationId },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { apiKeys } });
});

export const createApiKey = catchAsync(async (req, res) => {
  const { label, type } = req.body;
  const apiKey = await prisma.apiKey.create({
    data: {
      organizationId: req.organizationId,
      label,
      type,
      key: generateApiKey(type),
    },
  });
  res.status(201).json({ success: true, data: { apiKey } });
});

export const revokeApiKey = catchAsync(async (req, res) => {
  const { id } = req.params;

  const apiKey = await prisma.apiKey.findUnique({ where: { id } });
  if (!apiKey || apiKey.organizationId !== req.organizationId) {
    throw AppError.notFound('API key not found');
  }

  await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  res.status(200).json({ success: true, data: null });
});
