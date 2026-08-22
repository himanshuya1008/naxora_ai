import { prisma } from '../../config/db.js';

export async function upsertVisitor({ organizationId, fingerprint, email, name, company }) {
  return prisma.visitor.upsert({
    where: { organizationId_fingerprint: { organizationId, fingerprint } },
    update: {
      lastSeenAt: new Date(),
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
      ...(company ? { company } : {}),
    },
    create: {
      organizationId,
      fingerprint,
      email,
      name,
      company,
    },
  });
}

export async function getVisitorOr404(organizationId, visitorId) {
  return prisma.visitor.findFirst({ where: { id: visitorId, organizationId } });
}
