import { catchAsync } from '../utils/catchAsync.js';
import { upsertVisitor } from '../services/behavior/visitorService.js';
import { startSession as startSessionService, endSession as endSessionService } from '../services/behavior/sessionService.js';
import { ingestEvents as ingestEventsService } from '../services/behavior/eventIngestionService.js';

export const identifyVisitor = catchAsync(async (req, res) => {
  const visitor = await upsertVisitor({ organizationId: req.organizationId, ...req.body });
  res.status(200).json({ success: true, data: { visitor } });
});

export const startSession = catchAsync(async (req, res) => {
  const session = await startSessionService({ organizationId: req.organizationId, ...req.body });
  res.status(201).json({ success: true, data: { session } });
});

export const endSession = catchAsync(async (req, res) => {
  const session = await endSessionService({ organizationId: req.organizationId, sessionId: req.params.sessionId, ...req.body });
  res.status(200).json({ success: true, data: { session } });
});

export const ingestEvents = catchAsync(async (req, res) => {
  const { behaviorSummary } = await ingestEventsService({ organizationId: req.organizationId, ...req.body });
  res.status(202).json({ success: true, data: { interestScore: behaviorSummary.interestScore, decisionStage: behaviorSummary.decisionStage } });
});
