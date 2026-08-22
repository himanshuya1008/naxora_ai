import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export function issueAuthTokens(user) {
  const payload = { sub: user.id, organizationId: user.organizationId, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: user.id }),
  };
}

// Mirrors issueAuthTokens, but the `scope: 'visitor'` claim keeps a Visitor
// token from ever being accepted by the admin-side `protect` middleware (or
// vice versa) even though both are signed with the same JWT_SECRET —
// completely separate auth flows sharing infrastructure, not a shared
// principal type.
export function issueVisitorAuthTokens(visitor) {
  const payload = { sub: visitor.id, organizationId: visitor.organizationId, scope: 'visitor' };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: visitor.id, scope: 'visitor' }),
  };
}

// Short-lived, narrowly-scoped token authorizing an anonymous visitor's
// browser to open exactly one voice conversation's Socket.IO stream — not a
// full user session, so it can't be replayed to reach any other endpoint.
export function signVoiceToken({ conversationId, organizationId, visitorId }) {
  return jwt.sign({ conversationId, organizationId, visitorId, scope: 'voice' }, env.JWT_SECRET, { expiresIn: '2h' });
}

export function verifyVoiceToken(token) {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (decoded.scope !== 'voice') {
    throw new Error('Invalid token scope');
  }
  return decoded;
}
