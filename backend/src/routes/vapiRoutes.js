import { Router } from 'express';
import express from 'express';
import { verifyVapiWebhook } from '../middleware/verifyVapiWebhook.js';
import { handleVapiWebhook } from '../services/voice/vapiWebhookService.js';
import { logger } from '../utils/logger.js';

export const vapiRoutes = Router();

// express.raw() here (not the app-wide express.json()) so verifyVapiWebhook
// gets the untouched request body — needed whether Vapi's mechanism turns
// out to be a plain header check or an HMAC signature over the raw payload.
vapiRoutes.post('/webhook', express.raw({ type: '*/*', limit: '2mb' }), verifyVapiWebhook, (req, res) => {
  // Ack immediately: Vapi doesn't need a response body for end-of-call-report
  // / status-update, and the actual processing (LLM extraction, DB writes)
  // can take a few seconds — no reason to make Vapi's request wait on it.
  res.status(200).json({ received: true });

  handleVapiWebhook(req.body).catch((err) => {
    logger.error({ err }, 'Unhandled error processing Vapi webhook');
  });
});
