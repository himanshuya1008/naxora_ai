import crypto from 'node:crypto';

const PREFIX = {
  TRACKING_PUBLIC: 'pk_track',
  SERVER: 'sk_live',
};

// Prefixed, greppable keys (à la Stripe) so a leaked key's purpose is obvious
// at a glance, and so client code can safely assert it's using a public key.
export function generateApiKey(type) {
  const random = crypto.randomBytes(24).toString('hex');
  return `${PREFIX[type] ?? 'key'}_${random}`;
}
