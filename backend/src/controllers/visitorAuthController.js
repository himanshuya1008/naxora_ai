import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { issueVisitorAuthTokens, verifyRefreshToken, signAccessToken } from '../utils/tokens.js';
import { isProduction } from '../config/env.js';

// Separate cookie name from the admin flow's `refreshToken` — a visitor and
// an admin can be logged in in the same browser (e.g. testing) without one
// login overwriting the other's cookie.
const REFRESH_COOKIE_NAME = 'visitorRefreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function toPublicVisitor(visitor) {
  const { passwordHash: _passwordHash, ...publicVisitor } = visitor;
  return publicVisitor;
}

export const register = catchAsync(async (req, res) => {
  const { name, email, password, fingerprint } = req.body;
  const organizationId = req.organizationId;

  const existingRegistered = await prisma.visitor.findFirst({
    where: { organizationId, email, isRegistered: true },
  });
  if (existingRegistered) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
  }

  const passwordHash = await hashPassword(password);

  // Upgrade the existing anonymous row (matched by fingerprint) in place so
  // this account inherits its prior behavior/session/conversation history,
  // instead of creating a disconnected duplicate Visitor.
  const anonymous = fingerprint
    ? await prisma.visitor.findUnique({
        where: { organizationId_fingerprint: { organizationId, fingerprint } },
      })
    : null;

  const visitor =
    anonymous && !anonymous.isRegistered
      ? await prisma.visitor.update({
          where: { id: anonymous.id },
          data: { name, email, passwordHash, isRegistered: true, lastLoginAt: new Date() },
        })
      : await prisma.visitor.create({
          data: {
            organizationId,
            fingerprint: fingerprint ?? `registered-${crypto.randomUUID()}`,
            name,
            email,
            passwordHash,
            isRegistered: true,
            lastLoginAt: new Date(),
          },
        });

  const { accessToken, refreshToken } = issueVisitorAuthTokens(visitor);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    data: { visitor: toPublicVisitor(visitor), accessToken },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const organizationId = req.organizationId;

  const visitor = await prisma.visitor.findFirst({
    where: { organizationId, email, isRegistered: true },
  });
  if (!visitor || !visitor.passwordHash || !(await comparePassword(password, visitor.passwordHash))) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  await prisma.visitor.update({ where: { id: visitor.id }, data: { lastLoginAt: new Date() } });

  const { accessToken, refreshToken } = issueVisitorAuthTokens(visitor);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    data: { visitor: toPublicVisitor(visitor), accessToken },
  });
});

export const refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] ?? req.body?.refreshToken;
  if (!token) {
    throw AppError.unauthorized('No refresh token provided');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  if (decoded.scope !== 'visitor') {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const visitor = await prisma.visitor.findUnique({ where: { id: decoded.sub } });
  if (!visitor || !visitor.isRegistered) {
    throw AppError.unauthorized('Visitor account no longer exists');
  }

  const accessToken = signAccessToken({ sub: visitor.id, organizationId: visitor.organizationId, scope: 'visitor' });

  res.status(200).json({ success: true, data: { accessToken } });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ success: true, data: null });
});

export const me = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: { visitor: toPublicVisitor(req.visitor) } });
});
