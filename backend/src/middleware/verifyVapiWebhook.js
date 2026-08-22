import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Vapi sends the server.secret we configured back as the `x-vapi-secret`
// header on every webhook call (a shared-secret check, not an HMAC
// signature). We still read the body as a raw Buffer first (mounted ahead of
// the global express.json() parser in app.js) so this works unchanged even
// if Vapi's mechanism turns out to require signing the raw payload instead —
// only this file would need to change.
export function verifyVapiWebhook(req, res, next) {
  const receivedSecret = req.get('x-vapi-secret');

  if (!receivedSecret) {
    logger.warn({ headers: req.headers }, 'Vapi webhook request missing x-vapi-secret header');
    return res.status(401).json({ success: false, message: 'Missing webhook secret' });
  }

  const expected = Buffer.from(env.VAPI_WEBHOOK_SECRET);
  const received = Buffer.from(receivedSecret);

  const isValid =
    expected.length === received.length && crypto.timingSafeEqual(expected, received);

  if (!isValid) {
    logger.warn('Vapi webhook request had an invalid secret');
    return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
  }

  try {
    req.body = req.body.length ? JSON.parse(req.body.toString('utf8')) : {};
  } catch (err) {
    logger.error({ err }, 'Failed to parse Vapi webhook body as JSON');
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  next();
}
