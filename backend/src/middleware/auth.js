import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { prisma } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';

// Verifies the JWT, then re-fetches the user so a deactivated/deleted user or
// a role change is enforced immediately rather than trusting a stale token
// claim until it expires.
export const protect = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : req.cookies?.accessToken;

  if (!token) {
    throw AppError.unauthorized('You must be logged in to access this resource');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw AppError.unauthorized('Invalid or expired session, please log in again');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user) {
    throw AppError.unauthorized('User no longer exists');
  }

  req.user = user;
  req.organizationId = user.organizationId;
  next();
});

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
}
