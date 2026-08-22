import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Authenticates the public website tracking snippet. Scoped per-organization
// and revocable, unlike a single shared ingestion secret — a compromised key
// only exposes one customer's tracking endpoint, not the whole platform.
export const authenticateApiKey = catchAsync(async (req, res, next) => {
  const key = req.headers['x-api-key'];

  if (!key) {
    throw AppError.unauthorized('Missing API key', 'MISSING_API_KEY');
  }

  const apiKey = await prisma.apiKey.findUnique({ where: { key } });

  if (!apiKey || apiKey.revokedAt) {
    throw AppError.unauthorized('Invalid or revoked API key', 'INVALID_API_KEY');
  }

  req.organizationId = apiKey.organizationId;
  req.apiKeyId = apiKey.id;

  // Fire-and-forget usage tracking — must never block or fail the request.
  prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  next();
});
