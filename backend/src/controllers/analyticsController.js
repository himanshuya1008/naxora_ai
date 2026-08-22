import { catchAsync } from '../utils/catchAsync.js';
import * as analyticsService from '../services/analyticsService.js';

export const getOverview = catchAsync(async (req, res) => {
  const data = await analyticsService.getOverview(req.organizationId);
  res.status(200).json({ success: true, data });
});

export const getTrends = catchAsync(async (req, res) => {
  const data = await analyticsService.getTrends(req.organizationId, req.query.days);
  res.status(200).json({ success: true, data });
});

export const getLeadAnalytics = catchAsync(async (req, res) => {
  const data = await analyticsService.getLeadAnalytics(req.organizationId);
  res.status(200).json({ success: true, data });
});
