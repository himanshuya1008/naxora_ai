import { catchAsync } from '../utils/catchAsync.js';
import * as leadService from '../services/leadService.js';

// Public-facing: marketing site Contact/Book Demo forms. The AI Sales
// Consultant path creates/updates Leads separately, incrementally, from
// ai/conversationBrain/brain.js (via leadService.upsertLeadCapture) as the
// conversation reveals each field.
export const createLead = catchAsync(async (req, res) => {
  const lead = await leadService.createLead({ organizationId: req.organizationId, data: req.body });
  res.status(201).json({ success: true, data: { lead } });
});

export const listLeads = catchAsync(async (req, res) => {
  const { page, pageSize, status } = req.query;
  const result = await leadService.listLeads({ organizationId: req.organizationId, page, pageSize, status });
  res.status(200).json({ success: true, data: result });
});

export const getLeadDetail = catchAsync(async (req, res) => {
  const result = await leadService.getLeadDetail({ organizationId: req.organizationId, leadId: req.params.id });
  res.status(200).json({ success: true, data: result });
});
