import { catchAsync } from '../utils/catchAsync.js';
import { analyzeCustomer, getProfile, updateProfile, getDashboard } from '../services/customer-dna/index.js';

export const analyze = catchAsync(async (req, res) => {
  const profile = await analyzeCustomer({ organizationId: req.organizationId, ...req.body });
  res.status(201).json({ success: true, data: { profile } });
});

export const getBySession = catchAsync(async (req, res) => {
  const profile = await getProfile({ organizationId: req.organizationId, sessionId: req.params.sessionId });
  res.status(200).json({ success: true, data: { profile } });
});

export const update = catchAsync(async (req, res) => {
  const { sessionId, ...patch } = req.body;
  const profile = await updateProfile({ organizationId: req.organizationId, sessionId, patch });
  res.status(200).json({ success: true, data: { profile } });
});

export const dashboard = catchAsync(async (req, res) => {
  const data = await getDashboard({ organizationId: req.organizationId });
  res.status(200).json({ success: true, data });
});
