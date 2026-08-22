import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { prisma } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';

// Visitor-side equivalent of middleware/auth.js's `protect` — deliberately
// separate, not a shared/parameterized version of it, so admin and visitor
// auth stay two independently-reasoned-about flows per the V2 spec ("do not
// mix them"). Rejects on `scope !== 'visitor'` before ever touching the DB,
// so an admin access token can't be replayed against visitor-only routes.
export const protectVisitor = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : req.cookies?.visitorAccessToken;

  if (!token) {
    throw AppError.unauthorized('You must be logged in to access this resource');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw AppError.unauthorized('Invalid or expired session, please log in again');
  }

  if (decoded.scope !== 'visitor') {
    throw AppError.unauthorized('Invalid or expired session, please log in again');
  }

  const visitor = await prisma.visitor.findUnique({ where: { id: decoded.sub } });
  if (!visitor || !visitor.isRegistered) {
    throw AppError.unauthorized('Visitor account no longer exists');
  }

  req.visitor = visitor;
  req.organizationId = visitor.organizationId;
  next();
});
