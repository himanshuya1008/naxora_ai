import { prisma } from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { issueAuthTokens, verifyRefreshToken, signAccessToken } from '../utils/tokens.js';
import { generateUniqueSlug } from '../utils/slug.js';
import { generateApiKey } from '../utils/apiKey.js';
import { isProduction } from '../config/env.js';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function toPublicUser(user) {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export const register = catchAsync(async (req, res) => {
  const { organizationName, name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
  }

  const slug = await generateUniqueSlug(
    organizationName,
    async (candidate) => Boolean(await prisma.organization.findUnique({ where: { slug: candidate } }))
  );

  const passwordHash = await hashPassword(password);

  const { user, organization } = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName, slug },
    });

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        name,
        email,
        passwordHash,
        role: 'OWNER',
      },
    });

    await tx.apiKey.create({
      data: {
        organizationId: organization.id,
        key: generateApiKey('TRACKING_PUBLIC'),
        label: 'Default tracking key',
        type: 'TRACKING_PUBLIC',
      },
    });

    return { user, organization };
  });

  const { accessToken, refreshToken } = issueAuthTokens(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    data: { user: toPublicUser(user), organization, accessToken },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const { accessToken, refreshToken } = issueAuthTokens(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json({
    success: true,
    data: { user: toPublicUser(user), accessToken },
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

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user) {
    throw AppError.unauthorized('User no longer exists');
  }

  const accessToken = signAccessToken({ sub: user.id, organizationId: user.organizationId, role: user.role });

  res.status(200).json({ success: true, data: { accessToken } });
});

export const logout = catchAsync(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
  res.status(200).json({ success: true, data: null });
});

export const me = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: { user: toPublicUser(req.user) } });
});
