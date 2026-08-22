import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export async function createLead({ organizationId, data }) {
  return prisma.lead.create({ data: { organizationId, ...data } });
}

export async function listLeads({ organizationId, page, pageSize, status }) {
  const where = { organizationId, ...(status ? { status } : {}) };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { visitor: { select: { id: true, name: true, company: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

// Powers the dashboard's single-lead view: the lead itself (with its score),
// its conversation's full transcript, its post-call report (if generated
// yet), and a recent behavior timeline for the visitor — composed from
// already-existing data rather than a new bespoke query path.
export async function getLeadDetail({ organizationId, leadId }) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId },
    include: { visitor: { select: { id: true, name: true, company: true } } },
  });
  if (!lead) throw AppError.notFound('Lead not found');

  const [messages, report, visitorTimeline] = await Promise.all([
    lead.conversationId
      ? prisma.message.findMany({ where: { conversationId: lead.conversationId }, orderBy: { sequence: 'asc' } })
      : Promise.resolve([]),
    lead.conversationId ? prisma.report.findUnique({ where: { conversationId: lead.conversationId } }) : Promise.resolve(null),
    lead.visitorId
      ? prisma.behaviorEvent.findMany({
          where: { visitorId: lead.visitorId },
          orderBy: { occurredAt: 'desc' },
          take: 30,
          select: { id: true, type: true, page: true, label: true, occurredAt: true },
        })
      : Promise.resolve([]),
  ]);

  return { lead, messages, report, visitorTimeline };
}

// Transparent, documented heuristic — not an LLM call, so it costs no extra
// latency/API spend and stays fully explainable ("why is this lead a 72?").
// Weighted toward buying probability since that's the most direct signal of
// actual purchase readiness; interest and trust both contribute meaningfully.
export function computeLeadScore({ interestScore, trustScore, buyingProbability }) {
  const score = 0.4 * buyingProbability + 0.35 * interestScore + 0.25 * trustScore;
  return Math.round(Math.min(Math.max(score, 0), 100));
}

// Merges only the NEW non-null fields the model extracted this turn into the
// conversation's Lead row (never overwrites an already-captured field with
// null — the model is instructed to leave a field unset when unmentioned, not
// to re-confirm it), and keeps `leadScore` fresh every turn since the scores
// it's derived from change every turn even when no new lead facts are said.
export async function upsertLeadCapture({ conversationId, organizationId, visitorId, leadCapture, scores }) {
  const leadScore = computeLeadScore(scores);
  const fields = Object.fromEntries(Object.entries(leadCapture ?? {}).filter(([, value]) => value != null && value !== ''));

  if (Object.keys(fields).length === 0) {
    // No new facts this turn — only refresh the score, and only if a Lead
    // row already exists (don't create an empty one just to hold a score).
    await prisma.lead.updateMany({ where: { conversationId }, data: { leadScore } });
    return;
  }

  await prisma.lead.upsert({
    where: { conversationId },
    create: { organizationId, visitorId, conversationId, source: 'AI_CONVERSATION', leadScore, ...fields },
    update: { leadScore, ...fields },
  });
}
