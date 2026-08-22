import crypto from 'node:crypto';

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function generateUniqueSlug(baseText, isTaken) {
  const base = slugify(baseText) || 'organization';
  let slug = base;
  let attempts = 0;

  while (await isTaken(slug)) {
    attempts += 1;
    slug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
    if (attempts > 5) break; // astronomically unlikely, but never loop forever
  }

  return slug;
}
